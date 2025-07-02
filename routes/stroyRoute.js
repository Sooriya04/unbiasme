// routes/storyRoute.js
const express = require("express");
const router = express.Router();
const Story = require("../models/storySchema");
const { generateDailyStory } = require("../services/generateFullStory");

// Page to view today's story (UI loads it via /story/api)
router.get("/story", async (req, res) => {
  res.render("pages/story", { story: null });
});

// API to get or generate today's story
router.get("/story/api", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  try {
    let story = await Story.findOne({ date: today });
    if (story) return res.json({ ready: true, story });

    const generated = await generateDailyStory();
    if (!generated) return res.status(500).json({ ready: false });

    story = await Story.create({ ...generated, date: today });
    return res.json({ ready: true, story });
  } catch (err) {
    console.error("/story/api error:", err);
    res.status(500).json({ ready: false });
  }
});

module.exports = router;
