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

const FUNCTION_BLOCKS = {
  functionHead: `{`,
  openBrowser: (url) => `
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('${url}', { waitUntil: 'networkidle2' });
`,
  clickOnEle: (id) => `
    await page.click("#${id}");
  `,
  delay: (ms) => `await sleep(${ms});`,
  takeScreenshot: `
    const screenshot = await page.screenshot({
    encoding: "base64",
    fullPage: true,
  });
`,
  returnScreenshot: `return screenshot;`,
  closeBrowser: `await browser.close();`,
  closeBracket: "}",
  functionCall: `fetchImages()`,
};

async function performActions(url, actions) {
  wsSend("Start tasks...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });
  wsSend("Browser opened...");

  await sleep(500);
  wsSend(`Delay 500 ms...`);

  for (const action of actions) {
    const { type, value, targetId, addDelay, delay } = action;
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
