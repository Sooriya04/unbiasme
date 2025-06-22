const mongoose = require("mongoose");

const biasSchema = new mongoose.Schema({
  name: String,
  definition: String,
  example: String,
  prevention: String,
  date: {
    type: Date,
    default: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },
});

module.exports = mongoose.model("Bias", biasSchema);
