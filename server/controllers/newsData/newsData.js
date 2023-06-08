const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const router = require("express").Router();
const CronJob = require("cron").CronJob;
const Article = require("../../models/NewsCoins");
const https = require("https");

puppeteer.use(StealthPlugin());
const mainUrl = "https://cryptopotato.com/crypto-news/";

fetchNews();

router.get("/newsList", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createTime: -1 })
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const imageCache = new Map();

router.get("/article/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const updatedArticle = JSON.parse(JSON.stringify(article));
    updatedArticle.titleImage = await getImageProxyUrl(article.titleImage);

    updatedArticle.sections.forEach(async (section) => {
      for (let i = 0; i < section.image.length; i++) {
        section.image[i] = await getImageProxyUrl(section.image[i]);
      }
    });

    res.json(updatedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

async function getImageProxyUrl(imageUrl) {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl);
  }

  return new Promise((resolve, reject) => {
    https
      .get(imageUrl, (response) => {
        const chunks = [];

        response.on("data", (chunk) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const imageContent = Buffer.concat(chunks);
          const base64Image = imageContent.toString("base64");
          const dataUri = `data:${response.headers["content-type"]};base64,${base64Image}`;
          imageCache.set(imageUrl, dataUri);
          resolve(dataUri);
        });
      })
      .on("error", (error) => {
        console.error(error);
        reject(error);
      });
  });
}

const job = new CronJob(" */3 * * * *", () => {
  // fetchNews();
});

job.start();

async function fetchNews() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    protocolTimeout: 240000,
  });
  const page = await browser.newPage();
  await page.goto(`${mainUrl}`);

  const newsAllTitles = await page.evaluate(() => {
    const newsItems = document.querySelectorAll(".rpwe-title a");
    const newsItemsImg = document.querySelectorAll("li.rpwe-li a img");
    const newsArray = [];
    newsItems.forEach((item, i) => {
      const title = item.innerText;
      const href = item.href;
      const src = newsItemsImg[i].src;
      newsArray.push({ title, href, src });
    });

    return newsArray;
  });

  for (let i = 0; i < newsAllTitles.length; i++) {
    console.log("title", newsAllTitles[i].title);
    const title = newsAllTitles[i].title;
    const src = newsAllTitles[i].src;
    const isInDatabase = await checkIfTitleExistsInDatabase(title); //Enable after some article

    if (!isInDatabase) {
      const articlePage = await browser.newPage();
      await articlePage.goto(`${newsAllTitles[i].href}`);
      const articleData = await extractArticleData(articlePage, src);
      if (articleData) {
        await saveArticleToDatabase(articleData); // Save to DB
      }
    }
  }
  browser.close();
  console.log("Browser CLOSE =>>> X");
}

async function checkIfTitleExistsInDatabase(title) {
  const article = await Article.findOne({ title: title });
  return article !== null;
}

async function extractArticleData(page, imageUrl) {
  const articleData = {
    title: "",
    titleImage: "",
    sections: [],
    createTime: new Date().toISOString(),
  };

  let title = await page.$eval(".page-title", (element) => element.innerText);
  const existingArticle = await Article.findOne({ title });
  if (existingArticle) {
    console.log("Article already exists in the database. Skipping...");
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
    console.log("tagName =>>", tagName);

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
      console.log("h3");
      let paragraph = await section.evaluate((node) => node.textContent.trim());
      if (!paragraph) {
        const image = await section.$eval("img", (element) => element.src);
        if (lastSection && image) {
          lastSection.image.push(image);
        }
        // image
      } else if (lastSection.image.length >= 0 || lastSection.paragraph !== "") {
        console.log("img check");

        articleData.sections.push(lastSection);
        lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
      } else if (paragraph) {
        console.log("parapgraph");
        paragraph = paragraph.replace(/cryptopotato/gi, "ZTH");
        lastSection = { heading: "", text: [], paragraph, image: [], listItems: [] };
      }
    }
    // else if (tagName === "blockquote") {
    //   console.log("=>>>> Blockquate");
    //   let paragraphText;
    //   const paragraphElement = await section.$("p");
    //   if (paragraphElement) {
    //     paragraphText = await paragraphElement.evaluate((node) => node.textContent.trim());
    //     paragraphText = paragraphText.replace(/cryptopotato/gi, "ZTH");
    //     paragraphText = paragraphText.replace(/By:\sEdris|By:\sShayan/gi, "");
    //   }
    //   if (lastSection && paragraphText) {
    //     lastSection.paragraph += paragraphText + "\n";
    //   } else {
    //     try {
    //       const image = await section.$eval("img", (element) => element.src);
    //       if (lastSection && image) {
    //         lastSection.image.push(image);
    //       }
    //     } catch (error) {
    //       console.error(error);
    //       continue;
    //     }
    //   }
    else if (tagName === "blockquote") {
      const paragraphElements = await section.$$("p");
      for (const paragraphElement of paragraphElements) {
        let paragraphText = await paragraphElement.evaluate((node) => node.textContent.trim());
        console.log(paragraphText);
        paragraphText = paragraphText.replace(/cryptopotato/gi, "ZTH");
        paragraphText = paragraphText.replace(/By:\sEdris|By:\sShayan/gi, "");
        if (lastSection && paragraphText) {
          lastSection.paragraph += paragraphText + "\n";
        } else {
          try {
            const image = await section.$eval("img", (element) => element.src);
            if (lastSection && image) {
              lastSection.image.push(image);
            }
          } catch (error) {
            console.error(error);
            continue;
          }
        }
      }
    } else if (tagName === "p") {
      console.log("p tag");
      let text = await section.evaluate((node) => node.textContent.trim());
      text = text.replace(/cryptopotato/gi, "ZTH");
      text = text.replace(/By:\sEdris|By:\sShayan/gi, "");
      if (lastSection && text) {
        lastSection.text.push(text);
      } else {
        try {
          const image = await section.$eval("img", (element) => element.src);
          if (lastSection && image) {
            lastSection.image.push(image);
          }
        } catch (error) {
          console.error(error);
          continue;
        }
      }
    } else if (tagName === "figure") {
      const image = await section.$eval("img", (element) => element.src);
      if (lastSection && image) {
        lastSection.image.push(image);
        articleData.sections.push(lastSection);
        lastSection = { heading: "", text: [], paragraph: "", image: [], listItems: [] };
      }
    } else if (tagName === "ul") {
      console.log("ul tag =>>>>>>>>>>>>>>>");
      currentList = [];
      const listItems = await section.$$("li");
      for (const listItemElement of listItems) {
        let listItem = await listItemElement.evaluate((node) => node.textContent.trim());
        listItem = listItem.replace(/cryptopotato/gi, "ZTH");
        currentList.push(listItem);

        const nextSibling = await section.evaluateHandle((node) => node.nextElementSibling);
        const nextSiblingTagName = nextSibling
          ? await nextSibling.evaluate((node) => node.tagName.toLowerCase())
          : null;
        console.log("next siblings ===>>", nextSiblingTagName);

        if (
          nextSiblingTagName === "blockquote" ||
          nextSiblingTagName === "p" ||
          nextSiblingTagName === "figure" ||
          nextSiblingTagName === "h2"
        ) {
          lastSection.listItems.push(currentList.join("\n"));
        } else if (lastSection && currentList.length > 0) {
          lastSection.listItems = currentList;
        }
      }
    }
  }
  if (lastSection) {
    articleData.sections.push(lastSection);
  }

  return articleData;
}

async function saveArticleToDatabase(data) {
  const article = new Article({
    title: data.title,
    titleImage: data.titleImage,
    sections: data.sections,
    createTime: new Date().toISOString(),
  });

  await article.save();
}
module.exports = router;