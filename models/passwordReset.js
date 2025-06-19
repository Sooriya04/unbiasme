const mongoose = require("mongoose");
const passwordReset = new mongoose.Schema({
  userId: String,
  resetString: String,
  createdAt: Date,
  expireAt: Date,
});

module.exports = mongoose.model("passwordReset", passwordReset);
