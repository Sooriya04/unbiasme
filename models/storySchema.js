const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
<<<<<<< HEAD
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String }, // Format: YYYY-MM-DD
  title: String,
  content: String,
  biasName: String,
  biasDefinition: String,
  whatWentWrong: String,
  howMinimized: String,
  howHelps: String,
=======
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
>>>>>>> df39e96425527180b95fced7d79d5be8d2e853f9
});

module.exports = mongoose.model("Story", storySchema);
