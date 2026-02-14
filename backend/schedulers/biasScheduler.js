const cron = require("node-cron");
const Bias = require("../models/bias");
const { generateRandomBias } = require("../services/geminiBiasService");

function startBiasScheduler() {
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Remove any existing bias for today
      await Bias.deleteMany({ date: { $gte: today } });

      // Generate new bias (generateRandomBias saves to DB and returns saved doc)
      const saved = await generateRandomBias();
      if (saved) {
        console.log(`✅ Bias of the Day: ${saved.name}`);
      } else {
        console.warn("⚠️ Could not generate bias for today.");
      }
    } catch (err) {
      console.error("❌ Bias Cron Error:", err.message);
    }
  });
}

module.exports = startBiasScheduler;
