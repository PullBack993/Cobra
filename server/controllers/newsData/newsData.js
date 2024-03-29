const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const router = require("express").Router();
const CronJob = require("cron").CronJob;
const Article = require("../../models/NewsCoins");
const https = require("https");
const sharp = require("sharp");
const axios = require("axios");
const { removeStopwords, eng } = require("stopword");

const imageCache = new Map();

puppeteer.use(StealthPlugin());
const mainUrl = process.env.NEWS_URL;

fetchNews();

router.get("/newsList", async (req, res) => {
  const limit = 18;
  try {
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

    const updatedArticle = await Promise.all(
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

    res.json(updatedArticle);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error?.message });
  }
});

router.get("/article/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const updatedArticle = JSON.parse(JSON.stringify(article));
    updatedArticle.titleImage = await getImageProxyUrl(article.titleImage);
    updatedArticle.imageUrl = article.titleImage

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

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

    const response = await new Promise((resolve, reject) => {
      const request = https.get(imageUrl, (response) => {
        if (
          (response.statusCode >= 300 && response.statusCode <= 399) ||
          response.statusCode === undefined
        ) {
          const redirectUrl = new URL(response.headers.location);
          resolve(getImageProxyUrl(redirectUrl.href));
        } else {
          const fileSize = response.headers["content-length"];
          if (fileSize && fileSize > 1000000) {
            request.setTimeout(60000, () => {
              request.destroy(new Error("Request timed out"));
            });
          } else {
            resolve(response);
          }
        }
      });

      request.setTimeout(99990000, () => {
        request.destroy(new Error("Request timed out"));
      });

      request.on("error", (error) => {
        reject(error);
      });
    });

    if (response.statusCode !== 200) {
      throw new Error(
        `Failed to fetch image from ${imageUrl}. Status code: ${response.statusCode}`
      );
    }

    const contentType = response.headers["content-type"];
    if (!/^image\//.test(contentType)) {
      throw new Error(`Invalid image content type: ${contentType}`);
    }

    const chunks = [];

    await new Promise((resolve, reject) => {
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

    return imageCache.get(imageUrl);
  } catch (error) {
    console.error(error);
    // Handle the error, you can throw the error or return a default value
    // throw error;
    return [];
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
          }
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
    console.error(err);
    await browser?.close();
  }
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
    title = title.replace(/cryptopotato/gi, "ZTH");
    articleData.title = title;
    articleData.titleImage = imageUrl;

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
        heading = heading.replace(/cryptopotato/gi, "ZTH");
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
          paragraph = paragraph.replace(/cryptopotato/gi, "ZTH");
          lastSection.paragraph = paragraph;
          articleData.sections.push(lastSection);
          lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
        }
      } else if (tagName === "blockquote") {
        const paragraphElements = await section.$$("p");
        for (const paragraphElement of paragraphElements) {
          let paragraphText = await paragraphElement.evaluate((node) => node.textContent.trim());
          paragraphText = paragraphText.replace(/cryptopotato/gi, "ZTH");
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
        text = text.replace(/cryptopotato/gi, "ZTH");
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
          listItem = listItem.replace(/cryptopotato/gi, "ZTH");
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

async function generateShortenedUrl(title, id) {
  // TODO
  const longUrl = `https://one2hero.com/news/${id}/${encodeURIComponent(title)}`;
  // const shortenedUrl = await TinyURL.shorten(longUrl);
  return longUrl;
}

async function postTweet(data, id) {
  const tweetData = {
    text: data.title,
    imageUrl: data.titleImage,
    websiteUrl: await generateShortenedUrl(data.title, id),
    hashTags: await generateHashtags(data.title)
  };

  const tweetEndpoint = `${process.env.LOCAL_BASE_URL}/tweet`;

    axios.post(tweetEndpoint, tweetData)
      .then(response => {
        console.log('Tweet posted successfully');
      })
      .catch(error => {
        console.error('Error posting tweet:', error.message);
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
    const processedTitle =await preprocessTitle(newsTitle);

    const hashtags = postProcessHashtags(processedTitle);
    return hashtags
  } catch (err) {
    console.log("ERROR ->", err);
  }
}

async function preprocessTitle(title) {
  // Remove irrelevant characters, punctuation, and stop words
  const cleanTitle = title.replace(/[^a-zA-z0-9\s]/g, "");
  const words = cleanTitle.split(" ");

  // Filter out stop words
  const filteredWords = removeStopwords(words, [...eng, 'show','will','by', 'digits','watch','likely','two','possible','reasons','why','whats','price','popular']);
  const filteredWordsUpperPreference = []
  filteredWords.forEach((word)=> {
    if(word.toUpperCase() === word){
      filteredWordsUpperPreference.unshift(word)
    }else{
      filteredWordsUpperPreference.push(word);
    }
  })
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
