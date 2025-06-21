const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String }, // Format: YYYY-MM-DD
  title: String,
  content: String,
  biasName: String,
  biasDefinition: String,
  whatWentWrong: String,
  howMinimized: String,
  howHelps: String,
});

module.exports = mongoose.model("Story", storySchema);
