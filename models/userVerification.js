const mongoose = require("mongoose");

const userVerification = new mongoose.Schema({
  userId: String,
  uniqueString: String,
  createAt: Date,
  expireAt: Date,
});

module.exports = mongoose.model("userVerification", userVerification);
