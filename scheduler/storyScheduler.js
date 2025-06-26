// storyScheduler.js
const cron = require("node-cron");
const User = require("../models/user");
const Data = require("../models/dataSchema");
const Story = require("../models/storySchema");
const { generateDailyStory } = require("../services/generateFullStory");

async function generateTodayOnce() {
  console.log("Generating today's story...");

  const today = new Date().toISOString().split("T")[0];

  try {
    // delete only story for today — good
    await Story.deleteMany({ date: today });

    const user = await User.findOne();
    if (!user) {
      console.warn("No user found.");
      return;
    }

    const data = await Data.findOne({ userId: user._id });
    if (
      !data ||
      !data.geminiAnalysis ||
      Object.keys(data.geminiAnalysis).length === 0
    ) {
      console.warn("No geminiAnalysis found.");
      return;
    }

    const storyContent = await generateDailyStory(data.geminiAnalysis);
    if (!storyContent) {
      console.error("Story content generation failed.");
      return;
    }

    // OK to keep userId here since it's specific
    await Story.create({
      ...storyContent,
      userId: user._id,
      date: today,
    });

    console.log("Story created for", today);
  } catch (err) {
    console.error("Error creating story:", err);
  }
}

function startStoryScheduler() {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Running daily story cron...");
    await generateTodayOnce();
  });
}

module.exports = {
  startStoryScheduler,
  generateTodayOnce,
};
