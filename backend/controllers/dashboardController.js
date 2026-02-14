const User = require("../models/user");
const Data = require("../models/dataSchema");
const { DailyMCQEntry } = require("../models/dailyMCQEntry");
const { getGeminiAnalysis, generateContent } = require("../services/gemini");
const asyncHandler = require("../utils/asyncHandler");

/* ═══════════════ GET DASHBOARD ═══════════════ */

const getDashboard = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const data = await Data.findOne({ userId: user._id });

    const quizHistoryRaw = await DailyMCQEntry.find({ userId: user._id })
        .sort({ date: 1 })
        .limit(7)
        .lean();

    const quizHistory = quizHistoryRaw.slice(-7);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasTodayQuiz = quizHistory.some((entry) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
    });

    res.json({
        success: true,
        username: user.name || "User",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            gender: user.gender,
            dob: user.dob,
            age: user.age,
        },
        geminiData: data?.geminiAnalysis || null,
        traitScores: data?.traitScores || {},
        missingTraitScores: !data?.traitScores || Object.keys(data.traitScores).length === 0,
        analysisPending: !data?.geminiAnalysis?.summary,
        quizHistory,
        hasTodayQuiz,
    });
});

/* ═══════════════ GENERATE ANALYSIS ═══════════════ */

const generateAnalysis = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const data = await Data.findOne({ userId: user._id });
    if (!data || !data.traitScores || Object.keys(data.traitScores).length === 0) {
        return res.status(400).json({ success: false, message: "Trait scores not found" });
    }

    const prompt = generateContent(data.traitScores);
    const aiResponse = await getGeminiAnalysis(prompt);

    if (aiResponse) {
        data.geminiAnalysis = aiResponse;
        await data.save();
        return res.json({ success: true, geminiData: aiResponse });
    }

    res.status(500).json({ success: false, message: "Failed to generate analysis" });
});

module.exports = { getDashboard, generateAnalysis };
