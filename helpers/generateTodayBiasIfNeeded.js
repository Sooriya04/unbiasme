const Bias = require("../models/bias");
const { generateRandomBias } = require("../services/geminiBiasService");

async function generateTodayBiasIfNeeded() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const exists = await Bias.findOne({ date: { $gte: start, $lte: end } });
  if (exists) {
    console.log("✅ Bias of the Day already exists:", exists.name);
    return;
  }

  try {
    const biasData = await generateRandomBias();
    biasData.date = start;

    await Bias.create(biasData);
    console.log("✅ Bias generated at server start:", biasData.name);
  } catch (err) {
    console.error("  Failed to generate today's bias:", err.message);
  }
}

module.exports = generateTodayBiasIfNeeded;
