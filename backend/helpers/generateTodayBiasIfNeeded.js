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
    // generateRandomBias() already saves to DB and returns the saved document
    const saved = await generateRandomBias();
    if (saved) {
      console.log("✅ Bias generated at server start:", saved.name);
    } else {
      console.warn("⚠️ Could not generate today's bias (Gemini returned null).");
    }
  } catch (err) {
    console.error("❌ Failed to generate today's bias:", err.message);
  }
}

module.exports = generateTodayBiasIfNeeded;
