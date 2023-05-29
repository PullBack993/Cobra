const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const router = require("express").Router();
const CronJob = require("cron").CronJob;
const Article = require("../../models/NewsCoins");

puppeteer.use(StealthPlugin());
const mainUrl = "https://cryptopotato.com/crypto-news/";

fetchNews();

router.get("/news", async (req, res) => {
  // 2. Then that
  //  1.2. TODO fetch data from db and return.
  // 1. First implement this.
  //   2.1. TODO Every 3-5min. go to website fetch the news and check the title.
  //   3.1. TODO if title not exist,then go to news,fetch data,add to db.
});

const job = new CronJob(" */3 * * * *", () => {
  // fetchNews();
});

job.start();

async function fetchNews() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`${mainUrl}`);

  const newsAllTitles = await page.evaluate(() => {
    const newsItems = document.querySelectorAll(".rpwe-title a");
    const newsArray = [];
    newsItems.forEach((item) => {
      const title = item.innerText;
      const href = item.getAttribute("href");
      newsArray.push({ title, href });
    });

    return newsArray;
  });

  for (let i = 0; i < newsAllTitles.length; i++) {
    console.log("title", newsAllTitles[i].title);
    console.log("href", newsAllTitles[i].href);
    const title = newsAllTitles[i].title;
    const isInDatabase = await checkIfTitleExistsInDatabase(title); //Enable after some article

    if (!isInDatabase) {
      const articlePage = await browser.newPage();
      await articlePage.goto(`${newsAllTitles[i].href}`);
      const articleData = await extractArticleData(articlePage);
      if (articleData) {
        await saveArticleToDatabase(articleData); // Save to DB
        await articlePage.close();
      }
    }
  }
}

async function checkIfTitleExistsInDatabase(title) {
  const article = await Article.findOne({ title: title });
  return article !== null;
}

async function extractArticleData(page) {
  const articleData = {
    title: "",
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

  const sections = await page.$$("div.coincodex-content > *");

  let lastSection = null;
  let currentList = null;

  for (const section of sections) {
    const tagName = await section.evaluate((node) => node.tagName.toLowerCase());
    console.log("tagName =>>", tagName);

    if (!lastSection) {
      lastSection = { heading: "", text: "", paragraph: "", image: [], listItems: [] };
    }

    if (tagName === "h2") {
      if (
        lastSection.heading !== "" ||
        lastSection.text !== "" ||
        lastSection.image.length >= 0 ||
        lastSection.paragraph !== ""
      ) {
        articleData.sections.push(lastSection);
      }
      let heading = await section.evaluate((node) => node.textContent.trim());
      heading = heading.replace(/cryptopotato/gi, "ZTH");
      lastSection = { heading, text: "", paragraph: "", image: [], listItems: [] };
    } else if (tagName === "h3") {
      let paragraph = await section.evaluate((node) => node.textContent.trim());
      if (!paragraph) {
        const image = await section.$eval("img", (element) => element.src);
        if (lastSection && image) {
          lastSection.image.push(image);
        }
      } else if (lastSection.image.length >= 0 || lastSection.paragraph !== "") {
        articleData.sections.push(lastSection);
        lastSection = { heading: "", text: "", paragraph: "", image: [], listItems: [] };
      } else if (paragraph) {
        paragraph = paragraph.replace(/cryptopotato/gi, "ZTH");
        lastSection = { heading: "", text: "", paragraph, image: [], listItems: [] };
      }
    } else if (tagName === "p" || tagName === "blockquote") {
      let text = await section.evaluate((node) => node.textContent.trim());
      text = text.replace(/cryptopotato/gi, "ZTH");
      text = text.replace(/By\sEdris|By\sShayan/gi, "");
      if (lastSection && text) {
        lastSection.text += text + " ";
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
      }
    } else if (tagName === "ul") {
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
          lastSection.text += "\n"; // Add a new line before the list
          lastSection.text += currentList.join("\n");
        } else if (lastSection && currentList.length > 0) {
          lastSection.listItems = currentList;
        }
        // lastSection.text += "\n"; // Add a new line before the list
        // lastSection.text += listItem + '\n' // Append the list items to the text
      }
    }
  }

  // if (currentList && lastSection) {
  //   lastSection.text += "\n"; // Add a new line before the list
  //   lastSection.text += currentList.join("\n"); // Append the list items to the text
  // }

  if (lastSection) {
    articleData.sections.push(lastSection);
  }

  // Push the last section into articleData.sections if it exists
  console.log(articleData);
  return articleData;
}

async function saveArticleToDatabase(data) {
  console.log(data);
  const article = new Article({
    title: data.title,
    sections: data.sections,
    createTime: new Date().toISOString(),
  });

  await article.save();

  console.log("Article saved:", article);
}
module.exports = router;
