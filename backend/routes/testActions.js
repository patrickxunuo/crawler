const express = require("express");
const { performActions } = require("../puppeteer");
const { wsSend, setUpWebSocket, closeConnection } = require("../websocket");

const router = express.Router();

router.post("/", async (req, res) => {
  const { url, actionList } = req.body.body;

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  if (!actionList) {
    return res.status(400).send({ error: "ActionList is required" });
  }

  try {

    const screenshot = await performActions(url, actionList);

    // Close the WebSocket
    closeConnection();

    res.send({ screenshot });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
