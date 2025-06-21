const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  verified: Boolean,
  gender: String,
  dob: Date,
  age: Number,
  status: {
    type: String,
    enum: ["justSignedUp", "justSignedIn", null],
    default: null,
  },
});
module.exports = mongoose.model("User", userSchema);
