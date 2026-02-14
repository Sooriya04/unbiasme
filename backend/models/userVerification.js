const mongoose = require("mongoose");

const userVerificationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  uniqueString: String,
  createdAt: Date,
  expireAt: {
    type: Date,
    expires: 0,
  },
});

module.exports = mongoose.model("UserVerification", userVerificationSchema);
