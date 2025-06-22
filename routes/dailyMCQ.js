const express = require("express");
const router = express.Router();
const { DailyMCQEntry } = require("../models/dailyMCQEntry");
const currentUser = require("../middleware/currentUser");
const generateDailySummary = require("../services/generateDailySummary");

router.post("/submit", async (req, res) => {
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ message: "Not logged in" });

  const { questions } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length !== 3)
    return res.status(400).json({ message: "Invalid question data" });

  const today = new Date().toISOString().split("T")[0];

  // Prevent duplicate submission
  const existing = await DailyMCQEntry.findOne({
    userId: user._id,
    date: today,
  });
  if (existing) {
    return res.json({
      alreadySubmitted: true,
      message: "You've already submitted today's quiz.",
    });
  }

  try {
    const totalScore = questions.reduce(
      (sum, q) => sum + (q.userScore || 0),
      0
    );

    // Generate summary using Gemini
    const summary = await generateDailySummary(questions);
    console.log("Gemini summary:", summary);

    const saved = await DailyMCQEntry.create({
      userId: user._id,
      date: today,
      questions,
      totalScore,
      summary,
    });

    res.json({ message: "Saved daily MCQ", summary: saved.summary });
  } catch (err) {
    console.error("Save daily MCQ failed:", err);
    res.status(500).json({ message: "Failed to save daily entry" });
  }
});

module.exports = router;
