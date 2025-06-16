const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model("Question", QuestionSchema, "Questions");

router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load questions." });
  }
});

module.exports = router;
