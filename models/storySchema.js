const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  date: { type: String, unique: true }, // 👈 prevents duplicate
  title: String,
  content: String,
  biasName: String,
  biasDefinition: String,
  whatWentWrong: String,
  howMinimized: String,
  howHelps: String,
});

storySchema.index({ date: 1 }, { unique: true });
module.exports = mongoose.model("Story", storySchema);
