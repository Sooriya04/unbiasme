const cron = require("node-cron");
const Story = require("../models/storySchema");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    await Story.deleteOne({ date: today });
    console.log("Deleted today's story at 12 AM");
  } catch (err) {
    console.error("Error deleting story:", err);
  }
});
