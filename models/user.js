const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:     String,
  email:    String,
  password: String,
  verified: Boolean,
  traitScores: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model("User", userSchema);
