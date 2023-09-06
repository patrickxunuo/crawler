const express = require("express");
const { captureScreenshot } = require("../puppeteer");

const router = express.Router();

router.get("/", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  try {
    const screenshot = await captureScreenshot(url);
    res.send({ screenshot });
  } catch (error) {
    res.status(500).send({ error: "Failed to capture screenshot" });
  }
});

module.exports = router;
