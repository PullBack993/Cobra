const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const router = require("express").Router();
const CronJob = require("cron").CronJob;
const Article = require("../../models/NewsCoins");
const https = require("https");
const sharp = require("sharp");
const axios = require("axios");
const Tesseract = require("tesseract.js");
const { removeStopwords, eng } = require("stopword");

const imageCache = new Map();

puppeteer.use(StealthPlugin());
const mainUrl = process.env.NEWS_URL;
const newsCache = new Map();
const limit = 18;
const CACHE_DURATION = 6000000;

fetchNews();

// Caching middleware
async function cacheMiddleware(req, res, next) {
  const cacheKey = req.cacheKey;
  if (newsCache.has(cacheKey) && parseInt(req.query.page) === 1) {
    const cachedData = newsCache.get(cacheKey);
    if (Date.now() < cachedData.expiry) {
      return res.json(cachedData.data);
    }
  }
  next(); // Cache is not valid, proceed to fetch data
}
// Helper function to fetch articles
async function fetchArticles(queryOptions) {
  const { filter, sort, limit, range, page } = queryOptions;
  let skip = 0;
  let effectiveLimit = limit;

  if (page) {
    skip = (page - 1) * limit;
  }
  if (range) {
    effectiveLimit = limit * range;
  }

  return Article.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(effectiveLimit)
    .lean();
}



async function fetchSections(forceUpdate = false) {
  const cacheKey = "sections";
  const cachedData = newsCache.get(cacheKey);

  if (cachedData && Date.now() < cachedData.expiry && !forceUpdate) {
    return cachedData.data;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const latestArticle = await Article.findOne().sort({ createTime: -1 }).lean();

  // Once latestArticle is available, perform the other queries
  const [mostVisited, latestExcludingFirst, analysis] = await Promise.all([
    Article.find({ createTime: { $gte: thirtyDaysAgo.toISOString() } })
      .sort({ viewCount: -1, createTime: -1 })
      .limit(3)
      .lean(),
    Article.find().sort({ createTime: -1 }).skip(1).limit(12).lean(),
    Article.find({ title: /Analysis/i })
      .sort({ createTime: -1 })
      .limit(3)
      .lean(),
  ]);
  const sectionsData = { latestArticle, mostVisited, latestExcludingFirst, analysis };
  newsCache.set(cacheKey, {
    data: sectionsData,
    expiry: Date.now() + CACHE_DURATION, // Cache expiry time in milliseconds (e.g., 100 minutes)
  });
  return sectionsData;
}

router.get("/all", async (req, res) => {
  try {
    const forceUpdate = req.query.forceUpdate === "true"; // Allow forcing update via query param
    const data = await fetchSections(forceUpdate);
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch sections:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/latest-news", async (req, res) => {
  const cacheKey = "latest-news";
  try {
    if (newsCache.has(cacheKey) && parseInt(req.query.page) === 1) {
      const cachedData = newsCache.get(cacheKey);
      if (Date.now() < cachedData.expiry) {
        console.log("Take from cache"); // TODO remove
        return res.json(cachedData.data);
      }
    }

    let articles;
    if (req.query.range && !req.query?.page) {
      const range = req.query.range;
      const skip = (range - 1) * limit;
      articles = await Article.find().skip(skip).sort({ createTime: -1 }).limit(limit);
    } else if (req.query.range && req.query?.page === "back") {
      const range = req.query.range;
      articles = await Article.find()
        .sort({ createTime: -1 })
        .limit(limit * range);
    } else {
      const page = parseInt(req.query?.page);
      const skip = (page - 1) * limit;
      articles = await Article.find().skip(skip).sort({ createTime: -1 }).limit(limit);
    }
    const updatedArticles = await transformArticlesImage(articles);
    if (req.query.page === 1 && !newsCache.has(cacheKey)) {
      newsCache.set(cacheKey, { data: updatedArticles, expiry: Date.now() + 3000000 }); // Caches for 5 minutes
    }
    console.log("API TAake"); // TODO remove
    res.json(updatedArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error?.message });
  }
});

router.get("/top-stories", async (req, res) => {
  const cacheKey = "top-stories";
  try {
    if (newsCache.has(cacheKey) && parseInt(req.query.page) === 1) {
      const cachedData = newsCache.get(cacheKey);
      if (Date.now() < cachedData.expiry) {
        console.log("Take from cache");
        return res.json(cachedData.data);
      }
    }

    let articles;
    if (req.query.range && req.query.page === "back") {
      const range = req.query.range;
      articles = await Article.find({})
        .sort({ viewCount: -1, createTime: -1 })
        .limit(limit * range)
        .lean();
    } else {
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      articles = await Article.find({})
        .sort({ viewCount: -1, createTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const updatedArticles = await transformArticlesWithImage(articles);
    if (req.query.page === 1 && !newsCache.has(cacheKey)) {
      newsCache.set(cacheKey, { data: updatedArticles, expiry: Date.now() + 3000000 }); // Caches for 5 minutes
    }
    res.json(updatedArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/crypto-analysis", async (req, res) => {
  const cacheKey = "analysis";
  try {
    if (newsCache.has(cacheKey) && parseInt(req.query.page) === 1) {
      const cachedData = newsCache.get(cacheKey);
      if (Date.now() < cachedData.expiry) {
        console.log("Take from cache");
        return res.json(cachedData.data);
      }
    }

    let articles;
    console.log(req.query.page);
    if (req.query.range && req.query.page === "back") {
      const range = req.query.range;
      articles = await Article.find({ title: /Analysis/i })
        .sort({ createTime: -1 })
        .limit(limit * range)
        .lean();
    } else {
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;
      articles = await Article.find({ title: /Analysis/i })
        .sort({ createTime: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    }

    const updatedArticles = await transformArticlesWithImage(articles);
    if (req.query.page === 1 && !newsCache.has(cacheKey)) {
      newsCache.set(cacheKey, { data: updatedArticles, expiry: Date.now() + 3000000 }); // Caches for 5 minutes
    }
    res.json(updatedArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

async function transformArticlesWithImage(articles) {
  return Promise.all(
    articles.map(async (article) => {
      try {
        const image = await getImageProxyUrl(article.titleImage);
        return { ...article, titleImage: image };
      } catch (error) {
        console.error(error);
        return article; // Return the original article object if an error occurs
      }
    })
  );
}

async function transformArticlesImage(articles) {
  return await Promise.all(
    articles.map(async (section, i) => {
      try {
        const image = await getImageProxyUrl(section.titleImage);
        return { ...JSON.parse(JSON.stringify(section)), titleImage: image };
      } catch (error) {
        console.error(error);
        return section; // Return the original section object if an error occurs
      }
    })
  );
}

router.get("/article/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const updatedArticle = JSON.parse(JSON.stringify(article));
    updatedArticle.titleImage = await getImageProxyUrl(article.titleImage);
    updatedArticle.imageUrl = article.titleImage;

    await Promise.all(
      updatedArticle.sections.map(async (section) => {
        for (let i = 0; i < section.image.length; i++) {
          const parts = section.image[i].split("https://");
          const url = parts[2];
          section.image[i] = await getImageProxyUrl("https://" + url);
        }
      })
    );
    res.json(updatedArticle);

    Article.findByIdAndUpdate(articleId, { $inc: { viewCount: 1 } }).catch((err) =>
      console.error(`Error incrementing view count for article ${articleId}: ${err}`)
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/popular-recent", async (req, res) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  try {
    const recentArticles = await Article.find({
      createTime: { $gte: threeDaysAgo.toISOString() },
    })
      .sort({ viewCount: -1, createTime: -1 }) // Sort primarily by viewCount, then by createTime
      .exec();

    res.json(recentArticles);
  } catch (error) {
    res.status(500).send("Error fetching recent popular news: " + error.message);
  }
});

async function recognizeText(imageUrl) {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imageUrl, "eng", {});
    return (
      text.toLowerCase().includes("cryptopotato") ||
      text.toLowerCase().includes("crypbepobato") ||
      text.toLowerCase().includes("cryptepotate") ||
      text.toLocaleLowerCase().includes("crypbepobato")
    );
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

async function removeLogoFromImage(imageBuffer) {
  // Todo implement it! It should add own logo for each image at the bottom
  try {
    const logoPath = __dirname + "/zth.svg";

    const logoBuffer = await sharp(logoPath).resize(20, 10).toBuffer();

    const modifiedBuffer = await sharp(imageBuffer)
      .composite([{ input: logoBuffer, gravity: "southeast" }])
      .toBuffer();

    return modifiedBuffer;
  } catch (error) {
    console.error("Error removing logo:", error);
    throw error;
  }
}

async function getImageProxyUrl(imageUrl) {
  try {
    if (imageCache.has(imageUrl)) {
      return imageCache.get(imageUrl);
    }

    if (/one-2-hero/.test(imageUrl)) {
      return imageUrl;
    }

    const response = await new Promise((resolve, reject) => {
      const request = https.get(imageUrl, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode <= 399) {
          const redirectUrl = new URL(response.headers.location);
          resolve(getImageProxyUrl(redirectUrl.href));
          return;
        }

        if (!response.statusCode || response.statusCode !== 200) {
          reject(
            new Error(
              `Failed to fetch image from ${imageUrl}. Status code: ${
                response.statusCode || "Unknown"
              }`
            )
          );
          return;
        }

        const contentType = response.headers["content-type"];
        if (!/^image\//.test(contentType)) {
          reject(new Error(`Invalid image content type: ${contentType}`));
          return;
        }

        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const imageContent = Buffer.concat(chunks);
          const base64Image = imageContent.toString("base64");
          const dataUri = `data:${contentType};base64,${base64Image}`;
          imageCache.set(imageUrl, dataUri);
          resolve(dataUri);
        });

        response.on("error", (error) => {
          reject(error);
        });
      });

      request.setTimeout(15000, () => {
        request.destroy(new Error("Request timed out"));
      });

      request.on("error", (error) => {
        reject(error);
      });
    });

    return response;
  } catch (error) {
    console.error(error);
    return imageUrl;
  }
}

const job = new CronJob(" */3 * * * *", () => {
  try {
    fetchNews();
  } catch (err) {
    console.error(err);
  }
});

job.start();

async function fetchNews() {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      protocolTimeout: 240000,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(`${mainUrl}`);
    const newsAllTitles = await page.evaluate(() => {
      const newsItems = document.querySelectorAll(".list-item");
      const newsItemsImg = document.querySelectorAll(".list-item a img");
      const newsArray = [];
      newsItems.forEach((item, i) => {
        const titleElement = item.querySelector(".media-heading a");
        const title = titleElement ? titleElement.innerText : null;
        const href = titleElement ? titleElement.href : null;
        const imgElement = item.querySelector(".media-object");
        const src = imgElement ? imgElement.src : null;
        newsArray.push({ title, href, src });
      });

      return newsArray;
    });
    for (let i = 0; i < newsAllTitles.length; i++) {
      const title = newsAllTitles[i].title;
      const src = newsAllTitles[i].src;
      if (title) {
        const isInDatabase = await checkIfTitleExistsInDatabase(title); //Enable after some article

        if (!isInDatabase) {
          const articlePage = await browser.newPage();
          await articlePage.goto(`${newsAllTitles[i]?.href}`);
          const articleData = await extractArticleData(articlePage, src);
          if (articleData) {
            const article = await saveArticleToDatabase(articleData); // Save to DB
            postTweet(articleData, article._id);
            fetchSections(true);
          }
        } else if (!browser) {
          fetchNews();
        }
      }
    }
  } catch (error) {
    if (browser) {
      browser?.close();
    }
    console.error(error);
  } finally {
    if (browser) {
      browser?.close();
    }
  }
}

async function checkIfTitleExistsInDatabase(title) {
  try {
    const article = await Article.findOne({ title: title });
    return article !== null;
  } catch (err) {
    console.error(err.message);
  }
}

async function downloadImageAsBuffer(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
}

async function extractArticleData(page, imageUrl) {
  try {
    const articleData = {
      title: "",
      titleImage: "",
      sections: [],
      createTime: new Date().toISOString(),
    };

    let title = await page?.$eval(".page-title", (element) => element.innerText);
    const existingArticle = await Article.findOne({ title });
    if (existingArticle) {
      return;
    }

    let ogUrl = await page.evaluate(() => {
      const metaElement = document.head.querySelector('meta[property="og:image"]');
      return metaElement ? metaElement.getAttribute("content") : imageUrl;
    });

    const imageDataBuffer = await downloadImageAsBuffer(ogUrl);
    const containsText = await recognizeText(imageDataBuffer);
    if (containsText) {
      ogUrl =
        "https://firebasestorage.googleapis.com/v0/b/one-2-hero.appspot.com/o/one2hero-main.jpg?alt=media&token=445407e9-7857-44b8-81c0-75fc0113b915";
    }
    title = title.replace(/cryptopotato/gi, "O2H");
    articleData.title = title;
    articleData.titleImage = ogUrl;

    const sections = await page.$$("div.coincodex-content > *");

    let lastSection = null;
    let currentList = null;

    for (const section of sections) {
      const tagName = await section.evaluate((node) => node.tagName.toLowerCase());

      if (!lastSection) {
        lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
      }
      //Title
      if (tagName === "h2") {
        if (
          lastSection.heading !== "" ||
          lastSection.text.length >= 0 ||
          lastSection.image.length >= 0 ||
          lastSection.paragraph !== ""
        ) {
          articleData.sections.push(lastSection);
        }
        let heading = await section.evaluate((node) => node.textContent.trim());
        heading = heading.replace(/cryptopotato/gi, "O2H");
        lastSection = { heading, text: [], paragraph: "", image: [], listItems: [] };
        //Under title
      } else if (tagName === "h3") {
        let paragraph = await section.evaluate((node) => node.textContent.trim());
        if (!paragraph) {
          const image = await section?.$eval("img", (element) => element.src);
          if (lastSection && image) {
            lastSection.image.push(image);
            articleData.sections.push(lastSection);
            lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
          }
        } else if (paragraph) {
          paragraph = paragraph.replace(/cryptopotato/gi, "O2H");
          lastSection.paragraph = paragraph;
          articleData.sections.push(lastSection);
          lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
        }
      } else if (tagName === "blockquote") {
        const paragraphElements = await section.$$("p");
        for (const paragraphElement of paragraphElements) {
          let paragraphText = await paragraphElement.evaluate((node) => node.textContent.trim());
          paragraphText = paragraphText.replace(/cryptopotato/gi, "O2H");
          paragraphText = paragraphText.replace(/By:\sEdris|By:\sShayan/gi, "");
          if (lastSection && paragraphText) {
            lastSection.paragraph += paragraphText + "\n";
          } else {
            try {
              const image = await section?.$eval("img", (element) => element.src);
              if (lastSection && image) {
                lastSection.image.push(image);
                articleData.sections.push(lastSection);
                lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
              }
            } catch (error) {
              console.error(error);
              continue;
            }
          }
        }
        articleData.sections.push(lastSection);
        lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
      } else if (tagName === "p") {
        let text = await section.evaluate((node) => node?.textContent.trim());
        if (text === "TL;DR") {
          text = "";
        }
        text = text.replace(/cryptopotato/gi, "O2H");
        text = text.replace(/By:\sEdris|By:\sShayan/gi, "");
        if (lastSection && text) {
          lastSection.text.push(text);
        } else {
          try {
            const image = await section?.$eval("img", (element) => element.src);
            if (lastSection && image) {
              lastSection.image.push(image);
              articleData.sections.push(lastSection);
              lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
            }
          } catch (error) {
            console.error(error);
            continue;
          }
        }
      } else if (tagName === "figure") {
        const image = await section?.$eval("img", (element) => element.src);
        if (lastSection && image) {
          lastSection.image.push(image);
          articleData.sections.push(lastSection);
          lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
        }
      } else if (tagName === "ul") {
        currentList = [];
        const listItems = await section.$$("li");
        for (const listItemElement of listItems) {
          let listItem = await listItemElement.evaluate((node) => node.textContent.trim());
          listItem = listItem.replace(/cryptopotato/gi, "O2H");
          currentList.push(listItem);
        }
        lastSection.listItems = currentList;
        articleData.sections.push(lastSection);
        if (sections.length > sections.indexOf(section)) {
          lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
        }
      }
    }
    if (lastSection) {
      articleData.sections.push(lastSection);
    }

    return articleData;
  } catch (err) {
    console.log(err);
  }
}

function removeSpecialChars(urlTitle) {
  let result = encodeURIComponent(urlTitle.replace(/[^\w-]/g, "-").replace(/-{2,}/g, "-"));
  if (result.endsWith("-")) {
    result = result.slice(0, -1);
  }
  return result;
}

async function generateShortenedUrl(title, id) {
  // TODO
  // const longUrl = `https://one2hero.com/news/${id}/${encodeURIComponent(title)}`; old
  const longUrl = `https://one2hero.com/news/${id}/${removeSpecialChars(title)}`;
  // const shortenedUrl = await TinyURL.shorten(longUrl);
  return longUrl;
}

async function postTweet(data, id) {
  const tweetData = {
    text: data.title,
    imageUrl: data.titleImage,
    websiteUrl: await generateShortenedUrl(data.title, id),
    hashTags: await generateHashtags(data.title),
  };

  const tweetEndpoint = `${process.env.LOCAL_BASE_URL}/tweet`;

  axios
    .post(tweetEndpoint, tweetData)
    .then((response) => {
      console.log("Tweet posted successfully");
    })
    .catch((error) => {
      console.error("Error posting tweet:", error.message);
    });
}

async function saveArticleToDatabase(data) {
  try {
    const article = new Article({
      title: data.title,
      titleImage: data.titleImage,
      sections: data.sections,
      createTime: new Date().toISOString(),
    });

    return await article.save();
  } catch (err) {
    console.log(err);
  }
}

async function generateHashtags(newsTitle) {
  try {
    // Preprocess the news title
    const processedTitle = await preprocessTitle(newsTitle);

    const hashtags = postProcessHashtags(processedTitle);
    return hashtags;
  } catch (err) {
    console.log("ERROR ->", err);
  }
}

async function preprocessTitle(title) {
  // Remove irrelevant characters, punctuation, and stop words
  const cleanTitle = title.replace(/[^a-zA-z0-9\s]/g, "");
  const words = cleanTitle.split(" ");

  // Filter out stop words
  const filteredWords = removeStopwords(words, [
    ...eng,
    "show",
    "will",
    "by",
    "digits",
    "watch",
    "likely",
    "two",
    "possible",
    "reasons",
    "why",
    "whats",
    "price",
    "popular",
  ]);
  const filteredWordsUpperPreference = [];
  filteredWords.forEach((word) => {
    if (word.toUpperCase() === word) {
      filteredWordsUpperPreference.unshift(word);
    } else {
      filteredWordsUpperPreference.push(word);
    }
  });
  return filteredWordsUpperPreference;
}

function postProcessHashtags(predictedHashtags) {
  // Remove duplicates
  const uniqueHashtags = new Set(predictedHashtags);

  const hashtags = [...uniqueHashtags].map((hashtag) => "#" + hashtag);
  const filteredHashtags = hashtags.filter(
    (hashtag) => hashtag.length >= 3 && hashtag.length <= 20
  );
  return filteredHashtags;
}

module.exports = router;
