const fs = require("fs");
const axios = require("axios");
const path = require("path");
const puppeteer = require("puppeteer");
const { wsSend } = require("./websocket");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function captureScreenshot(url) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const screenshot = await page.screenshot({
    encoding: "base64",
    fullPage: true,
  });

  await browser.close();

  return screenshot;
}

async function performActions(url, actions) {
  // Define a folder and check if it exists
  const folderPath = path.join(__dirname, "downloadedImages");
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  let currentBreed;
  let subfolder;
  let savedOptions = [];

  async function processCatBreed(targetId, targetSegment, cb) {
    subfolder = path.join(folderPath, cb);

    if (!fs.existsSync(subfolder)) {
      fs.mkdirSync(subfolder);
    }

    page.on("response", responseHandler);

    await page.select("#" + targetId, cb);

    await sleep(1000);
    page.off("response", responseHandler);

    const tgs = await page.evaluate(
      (breed, segment) => {
        const potentialTargets = document.querySelectorAll("div.option_name");

        const target = Array.from(potentialTargets).find((pt) =>
          pt.innerText?.includes(breed),
        );

        if (!target) return [];

        const parent = target.parentNode;
        const index = parent.getAttribute("for")?.split("-").at(-1);

        const container = document.querySelector(
          `#cl-option-accordion-${segment}-${index}`,
        );
        const tgs = container ? container.querySelectorAll("input") : [];

        return Array.from(tgs).map((tg) => tg.id);
      },
      cb,
      targetSegment,
    );

    if (tgs.length === 0) {
      wsSend(`${cb} is missing`);
    }

    for (const [index, tg] of tgs.entries()) {
      page.on("response", responseHandler);
      wsSend(`${cb} (${index + 1}/${tgs.length})`);
      await page.evaluate((tg) => {
        const target = document.querySelector(`#${tg}`);
        target.click();
      }, tg);
      await sleep(1000);
      page.off("response", responseHandler);
    }
  }

  // Download and save an image
  async function downloadImage(folderPath, url, filename) {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(path.join(folderPath, filename));

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  async function responseHandler(response) {
    if (
      response.request().resourceType() === "image" &&
      response.url().includes("https://cdn.customily.com/product-images")
    ) {
      const img = response.url();
      console.log(`Image response URL of dog breed ${currentBreed}: ${img}`);

      await downloadImage(subfolder, img, img.split("/").at(-1));
    }
  }

  wsSend("Start tasks...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  wsSend("Browser opened...");

  await sleep(500);
  wsSend(`Delay 500 ms...`);

  for (const action of actions) {
    const { type, value, targetId, addDelay, delay, optionName, targetOption } =
      action;
    switch (type) {
      case "CLICK":
        wsSend(`Start clicking on #${targetId}...`);
        await page.evaluate(async (id) => {
          const targetEle = document.querySelector(`#${id}`);
          targetEle.click();
        }, targetId);
        wsSend(`Successfully clicked on #${targetId}`);
        break;
      case "SELECT":
        wsSend(`Start picking value "${value}" on #${targetId}...`);
        await page.select(`#${targetId}`, value);
        wsSend(`Successfully selected value "${value}" on #${targetId}`);
        break;
      case "GET_OPTIONS":
        wsSend(`Start getting options on #${targetId}...`);
        const options = await page.evaluate((id) => {
          const element = document.querySelector(`#${id}`);
          return element._vOptions
            ?.map((o) => o.trim())
            .filter((o) => o != null && o != "");
        }, targetId);

        savedOptions.push({ targetId, optionName, options });

        wsSend(
          `${optionName} has total of ${options.length} options: ${options}`,
        );
        wsSend(`Successfully got options on #${targetId}`);
        break;
      case "LOOP":
        const targetObj = savedOptions.find(
          (option) => option.optionName === targetOption,
        );
        wsSend(`Start looping through ${targetObj.optionName}`);
        let targetIdSegment = "";
        const regex = /cl-set-(.*?)-cl-option/;
        const match = targetObj.targetId?.match(regex);
        if (match && match[1]) targetIdSegment = match[1];

        for (const option of targetObj.options) {
          currentBreed = option;
          wsSend(`now processing ${option}...`);
          await processCatBreed(targetObj.targetId, targetIdSegment, option);
        }
        wsSend(`Successfully looped ${targetObj.optionName}`);
        break;
      default:
        break;
    }
    if (addDelay) {
      await sleep(delay);
      wsSend(`Delay ${delay} ms...`);
    }
  }

  wsSend("Start taking screenshot...");
  const screenshot = await page.screenshot({
    encoding: "base64",
    fullPage: true,
  });
  wsSend("Successfully took screenshot");

  await browser.close();
  wsSend("Browser closed");

  return screenshot;
}

module.exports = {
  captureScreenshot,
  performActions,
};
