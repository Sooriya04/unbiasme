const Story = require("../models/storySchema");
const { generateDailyStory } = require("../services/generateFullStory");
const asyncHandler = require("../utils/asyncHandler");

/* ═══════════════ GET TODAY'S STORY ═══════════════ */

const getStory = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    let story = await Story.findOne({ date: today });
    if (story) {
        return res.json({ success: true, ready: true, story });
    }

    const generated = await generateDailyStory();
    if (!generated) {
        return res.status(500).json({ success: false, ready: false });
    }

    story = await Story.create({ ...generated, date: today });
    res.json({ success: true, ready: true, story });
});

module.exports = { getStory };
