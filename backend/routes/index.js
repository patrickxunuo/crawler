const express = require("express");
const testActionsRoute = require("./testActions");
const screenshotRoute = require("./screenshot");

const router = express.Router();

router.use("/screenshot", screenshotRoute);

router.use("/test-actions", testActionsRoute);

module.exports = router;
