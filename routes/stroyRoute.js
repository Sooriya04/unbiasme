const express = require("express");
const router = express.Router();
const Story = require("../models/storySchema");
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
    const generatedStory = await generateDailyStory();
    if (!generatedStory) {
      return res.status(500).json({
        ready: false,
        message: "  Story could not be generated. Try again later.",
      });
    }

    story = await Story.create({ ...generatedStory, date: today });
    return res.json({ ready: true, story });
  } catch (err) {
    console.error("  /story/api error:", err);
    return res.status(500).json({ ready: false });
  }
});

module.exports = router;
