const express = require("express");
const router = express.Router();
const Story = require("../models/storySchema");
const Data = require("../models/dataSchema");
const { generateDailyStory } = require("../services/geminiStory");

router.get("/story", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await Story.findOne({ date: today });
  const story = await Story.findOne({ date: today });

  res.render("pages/story", { story: existing });
});

router.get("/story/api", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  let story = await Story.findOne({ date: today });

  if (story) return res.json({ ready: true, story });

  const user = await User.findOne();
  const data = await Data.findOne({ userId: user._id });

  if (!data?.geminiAnalysis)
    return res.json({ ready: false, message: "Gemini analysis not available" });

  try {
    const storyContent = await generateDailyStory(data.geminiAnalysis);
    story = await Story.create({ ...storyContent, date: today });
    return res.json({ ready: true, story });
  } catch (e) {
    console.error("Story generation error:", e);
    return res.status(500).json({ ready: false, message: "Generation failed" });
  }
});

module.exports = router;
