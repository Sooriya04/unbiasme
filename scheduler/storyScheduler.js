const cron = require("node-cron");
const Story = require("../models/storySchema");
const Data = require("../models/dataSchema");
const User = require("../models/user");
const { generateDailyStory } = require("../services/generateFullStory");

cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().slice(0, 10);
    await Story.deleteMany({ date: yDate });

    const existing = await Story.findOne({ date: today });
    if (existing) return;

    const user = await User.findOne();
    const data = await Data.findOne({ userId: user._id });
    if (!data?.geminiAnalysis) {
      console.warn("No Gemini analysis available for story.");
      return;
    }

    const content = await generateDailyStory(data.geminiAnalysis);
    await Story.create({ ...content, date: today });

    console.log("New story generated at midnight.");
  } catch (err) {
    console.error("Story cron error:", err.message);
  }
});
