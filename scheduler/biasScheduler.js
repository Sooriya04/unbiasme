const cron = require("node-cron");
const mongoose = require("mongoose");
const Bias = require("../models/bias");
const { generateRandomBias } = require("../services/geminiBiasService");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Bias.deleteMany({ date: { $gte: today } });

    const biasData = await generateRandomBias();
    biasData.date = today;

    const newBias = new Bias(biasData);
    await newBias.save();

    console.log(`✅ Bias of the Day: ${newBias.name}`);
  } catch (err) {
    console.error("  Cron Error:", err.message);
  }
});
