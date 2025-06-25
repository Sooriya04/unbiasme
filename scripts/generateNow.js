const mongoose = require("mongoose");
require("dotenv").config();

const Bias = require("../models/bias");
const { generateRandomBias } = require("../services/geminiBiasService");

async function generateNow() {
  await mongoose.connect(process.env.MONGODB_URI);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Bias.deleteMany({ date: { $gte: today } });

  const biasData = await generateRandomBias();
  biasData.date = today;

  await Bias.create(biasData);
  console.log("✅ Today's Bias Saved:", biasData.name);

  mongoose.disconnect();
}

generateNow().catch((err) => {
  console.error("  Error generating now:", err.message);
  process.exit(1);
});
