const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    A: String,
    B: String,
    C: String,
    D: String,
    E: String,
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    text: String,
    options: OptionSchema,
  },
  { _id: false }
);

const DailyMCQQuestionSetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  questions: [QuestionSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24, // 24 hours in seconds
  },
});

module.exports = mongoose.model(
  "DailyMCQQuestionSet",
  DailyMCQQuestionSetSchema
);
