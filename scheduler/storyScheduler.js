// scheduler/storyScheduler.js
const cron = require("node-cron");
const User = require("../models/user");
const Data = require("../models/dataSchema");
const Story = require("../models/storySchema");
const { generateDailyStory } = require("../services/generateFullStory");

async function generateTodayOnce() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`📝 Checking story for ${today}...`);

  try {
    // Prevent duplicate insert
    const existing = await Story.findOne({ date: today });
    if (existing) {
      console.log("✅ Story already exists for today.");
      return;
    }

    // Get any one user with analysis data
    const user = await User.findOne();
    if (!user) {
      console.warn("⚠️ No users found in database.");
      return;
    }

    const data = await Data.findOne({ userId: user._id });
    if (
      !data ||
      !data.geminiAnalysis ||
      Object.keys(data.geminiAnalysis).length === 0
    ) {
      console.warn("⚠️ Gemini analysis not found for user:", user._id);
      return;
    }

    const storyContent = await generateDailyStory(data.geminiAnalysis);
    if (!storyContent) {
      console.error("❌ Failed to generate story content.");
      return;
    }

    await Story.create({
      ...storyContent,
      userId: user._id, // Just a placeholder to know who it came from
      date: today,
    });

    console.log(`✅ Daily story created for ${today}`);
  } catch (err) {
    console.error("🔥 Error during daily story generation:", err);
  }
}

// Schedule to run every day at 00:00 (12:00 AM server time)
function startStoryScheduler() {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Cron job: Running daily story check...");
    await generateTodayOnce();
  });
}

module.exports = {
  startStoryScheduler,
  generateTodayOnce,
};
