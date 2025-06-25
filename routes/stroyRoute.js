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
        message: "Story could not be generated. Try again later.",
      });
    }

    story = await Story.create({ ...generatedStory, date: today });
    return res.json({ ready: true, story });
  } catch (err) {
    console.error("/story/api error:", err);
    return res.status(500).json({ ready: false });
  }
});

router.post("/story", async (req, res) => {
  try {
    const newStory = await Story.create(req.body);
    res.status(201).json(newStory);
  } catch (err) {
    console.error("Create story error:", err);
    res.status(400).json({ error: "Story could not be created" });
  }
});

router.get("/story/export", async (req, res) => {
  try {
    const stories = await Story.find().sort({ date: -1 });
    res.json(stories);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Could not fetch stories" });
  }
});

router.put("/story/:id", async (req, res) => {
  try {
    const updated = await Story.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    console.error("Update story error:", err);
    res.status(400).json({ error: "Could not update story" });
  }
});

router.delete("/story/:id", async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: "Story deleted" });
  } catch (err) {
    console.error("Delete story error:", err);
    res.status(400).json({ error: "Could not delete story" });
  }
});

module.exports = router;
