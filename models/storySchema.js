const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  content: {
    title: String,
    content: String,
    biasName: String,
    biasDefinition: String,
    whatWentWrong: String,
    howMinimized: String,
    howHelps: String,
  },
  createdAt: { type: Date, default: Date.now },
  expireAt: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setHours(24, 0, 0, 0); // expires at midnight
      return d;
    },
    index: { expires: 0 },
  },
});

module.exports = mongoose.model("Story", storySchema);
