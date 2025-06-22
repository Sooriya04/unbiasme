const generateTodayBiasIfNeeded = require("../helpers/generateTodayBiasIfNeeded");

async function initBiasGenerator() {
  try {
    await generateTodayBiasIfNeeded();
  } catch (err) {
    console.error("❌ Bias generation failed:", err.message);
  }
}

module.exports = initBiasGenerator;
