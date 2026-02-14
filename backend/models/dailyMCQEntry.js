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
    userAnswer: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
    },
    userScore: Number,
  },
  { _id: false }
);

const DailyMCQEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },
  questions: [QuestionSchema],
  totalScore: Number,
  summary: { type: String, required: true },
});

const CombinedSummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now },
  combinedSummary: { type: String, required: true },
});

const DailyMCQEntry = mongoose.model("DailyMCQEntry", DailyMCQEntrySchema);
const DailyMCQSummary = mongoose.model(
  "DailyMCQSummary",
  CombinedSummarySchema
);

module.exports = {
  DailyMCQEntry,
  DailyMCQSummary,
};
