// routes/story.js
const express = require("express");
const router = express.Router();
const Story = require("../models/storySchema");
const Data = require("../models/dataSchema");
const User = require("../models/user");
const { generateFullStory } = require("../services/generateFullStory");

let isGenerating = false;

// GET /story - Render story page, start generation if needed
router.get("/story", async (req, res) => {
  try {
    const storyDoc = await Story.findOne().sort({ createdAt: -1 });
    const now = new Date();

    const isToday =
      storyDoc && storyDoc.createdAt.toDateString() === now.toDateString();

    res.render("pages/story", {
      story: isToday ? storyDoc.content : null,
      generating: isGenerating,
    });

    // If no story and not generating, generate in background
    if (!isToday && !isGenerating) {
      isGenerating = true;

      const user = await User.findOne();
      const data = await Data.findOne({ userId: user._id });

      if (!data?.geminiAnalysis?.summary) {
        console.warn("Missing geminiAnalysis for story.");
        isGenerating = false;
        return;
      }

      const generated = await generateFullStory(data.geminiAnalysis);
      if (generated) {
        await Story.create({ content: generated });
        console.log("✅ Story generated");
      } else {
        console.error("❌ Failed to generate story");
      }

      isGenerating = false;
    }
  } catch (err) {
    isGenerating = false;
    console.error("GET /story error:", err);
    res.status(500).send("Error loading story");
  }
});

// GET /story/api - AJAX polling to check if story is ready
router.get("/story/api", async (req, res) => {
  try {
    const storyDoc = await Story.findOne().sort({ createdAt: -1 });
    const now = new Date();

    if (storyDoc && storyDoc.createdAt.toDateString() === now.toDateString()) {
      return res.json({ ready: true, story: storyDoc.content });
    }

    return res.json({ ready: false });
  } catch (err) {
    console.error("/story/api error:", err);
    return res.status(500).json({ ready: false });
  }
});

module.exports = router;
