const express = require("express");
const router = express.Router();
const Story = require("../models/storySchema");
const Data = require("../models/dataSchema");
const { generateDailyStory } = require("../services/geminiStory");

router.get("/story", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.redirect("/signin");

  const today = new Date().toISOString().slice(0, 10);
  const existing = await Story.findOne({ userId, date: today });

  res.render("pages/story", { story: existing });
});

router.get("/story/api", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const today = new Date().toISOString().slice(0, 10);
  let story = await Story.findOne({ userId, date: today });
  if (story) return res.json({ ready: true, story });

  const data = await Data.findOne({ userId });
  if (!data?.geminiAnalysis)
    return res.json({ ready: false, message: "Gemini analysis not available" });

  const storyContent = await generateDailyStory(data.geminiAnalysis);
  story = await Story.create({ ...storyContent, userId, date: today });

  res.json({ ready: true, story });
});

module.exports = router;
