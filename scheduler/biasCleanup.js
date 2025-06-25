const cron = require("node-cron");
const Bias = require("../models/bias");

function startBiasCleanupScheduler() {
  cron.schedule("0 0 * * *", async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 15);

    const result = await Bias.deleteMany({ date: { $lt: cutoff } });
    console.log(`Old biases removed: ${result.deletedCount}`);
  });
}

module.exports = startBiasCleanupScheduler;
