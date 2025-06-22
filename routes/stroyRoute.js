const express = require("express");
const router = express.Router();
const Story = require("../models/storySchema");
const Data = require("../models/dataSchema");
const User = require("../models/user");
const { generateDailyStory } = require("../services/generateFullStory");

router.get("/story", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const story = await Story.findOne({ date: today });
  res.render("pages/story", { story });
});

router.get("/story/api", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  let story = await Story.findOne({ date: today });

  if (story) return res.json({ ready: true, story });

  try {
    const user = await User.findOne();
    const data = await Data.findOne({ userId: user._id });

    if (!data?.geminiAnalysis)
      return res
        .status(404)
        .json({ ready: false, message: "No analysis data" });

    const storyContent = await generateDailyStory(data.geminiAnalysis);
    story = await Story.create({ ...storyContent, date: today });

    return res.json({ ready: true, story });
  } catch (e) {
    console.error("Story API error:", e);
    return res.status(500).json({ ready: false });
  }
});

module.exports = router;
