const express = require("express");
const router = express.Router();
const storyController = require("../controllers/storyController");

router.get("/today", storyController.getStory);

module.exports = router;
