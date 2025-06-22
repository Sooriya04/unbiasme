const mongoose = require("mongoose");

const biasSchema = new mongoose.Schema(
  { name: String, description: String, example: String, prevention: String },
  { _id: false }
);
const workplaceSchema = new mongoose.Schema(
  { environment: String, strengths: String, challenges: String },
  { _id: false }
);
const geminiAnalysisSchema = new mongoose.Schema(
  { summary: String, biases: [biasSchema], workplace: workplaceSchema },
  { _id: false }
);

/* ---------- main schema ---------- */
const dataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  traitScores: { type: Object, default: {} },
  geminiAnalysis: { type: geminiAnalysisSchema, default: {} },
});

module.exports = mongoose.model("Data", dataSchema);
