const cron = require("node-cron");
const User = require("../models/user");
const Data = require("../models/dataSchema");
const Story = require("../models/storySchema");
const { generateDailyStory } = require("../services/generateFullStory");

function startStoryScheduler() {
  cron.schedule("0 0 * * *", async () => {
    console.log("Generating daily story...");

    const today = new Date().toISOString().split("T")[0];
    const existing = await Story.findOne({ date: today });
    if (existing) {
      console.log("Story already exists for today");
      return;
    }

    try {
      const user = await User.findOne();
      const data = await Data.findOne({ userId: user._id });

      if (!data?.geminiAnalysis) {
        console.warn("No Gemini analysis found — story skipped.");
        return;
      }

      const storyContent = await generateDailyStory(data.geminiAnalysis);
      if (!storyContent) {
        console.error("Failed to generate story content");
        return;
      }

      await Story.create({
        ...storyContent,
        userId: user._id,
        date: today,
      });

      console.log("Daily story saved to DB");
    } catch (err) {
      console.error("Daily story scheduler error:", err);
    }
  });
}

module.exports = startStoryScheduler;
