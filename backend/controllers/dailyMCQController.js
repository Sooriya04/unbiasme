const User = require("../models/user");
const DailyMCQQuestionSet = require("../models/DailyMCQQuestionSet");
const { DailyMCQEntry, DailyMCQSummary } = require("../models/dailyMCQEntry");
const generateDailyMCQQuestions = require("../services/generateDailyMCQQuestions");
const generateDailySummary = require("../services/generateDailySummary");
const asyncHandler = require("../utils/asyncHandler");

/* ═══════════════ GET QUESTIONS ═══════════════ */

const getQuestions = asyncHandler(async (req, res) => {
    const today = new Date().toISOString().split("T")[0];

    // Check if already submitted today
    const existingEntry = await DailyMCQEntry.findOne({
        userId: req.user._id,
        date: today,
    });

    if (existingEntry) {
        return res.json({
            success: true,
            alreadySubmitted: true,
            summary: existingEntry.summary,
        });
    }

    // Get or generate question set for today
    let qsDoc = await DailyMCQQuestionSet.findOne({
        userId: req.user._id,
        date: today,
    });

    if (!qsDoc) {
        const questions = await generateDailyMCQQuestions();
        qsDoc = await DailyMCQQuestionSet.create({
            userId: req.user._id,
            date: today,
            questions,
        });
    }

    res.json({ success: true, questions: qsDoc.questions });
});

/* ═══════════════ SUBMIT ANSWERS ═══════════════ */

const submit = asyncHandler(async (req, res) => {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length !== 3) {
        return res.status(400).json({ success: false, message: "Invalid question data" });
    }

    const today = new Date().toISOString().split("T")[0];

    if (await DailyMCQEntry.exists({ userId: req.user._id, date: today })) {
        return res.json({
            success: true,
            alreadySubmitted: true,
            message: "You've already submitted today's quiz.",
        });
    }

    const totalScore = questions.reduce((sum, q) => sum + (q.userScore || 0), 0);
    const summary = await generateDailySummary(questions);

    const saved = await DailyMCQEntry.create({
        userId: req.user._id,
        date: today,
        questions,
        totalScore,
        summary,
    });

    res.json({ success: true, summary: saved.summary });
});

/* ═══════════════ GET HISTORY ═══════════════ */

const getHistory = asyncHandler(async (req, res) => {
    const entries = await DailyMCQEntry.find({ userId: req.user._id })
        .sort({ date: 1 })
        .select("date totalScore summary -_id");

    res.json({ success: true, entries });
});

/* ═══════════════ ANALYZE (COMBINED SUMMARY) ═══════════════ */

const analyzeGemini = asyncHandler(async (req, res) => {
    const entries = await DailyMCQEntry.find({ userId: req.user._id }).sort({ date: 1 });

    if (!entries.length) {
        return res.status(400).json({ success: false, message: "No entries yet" });
    }

    const prompt = entries.map((e) => `Date ${e.date}: ${e.summary}`).join("\n\n");

    const combined = await generateDailySummary([
        {
            text: prompt,
            options: { A: "", B: "", C: "", D: "", E: "" },
            userAnswer: "A",
            userScore: 0,
        },
    ]);

    await DailyMCQSummary.findOneAndUpdate(
        { userId: req.user._id },
        { combinedSummary: combined, updatedAt: new Date() },
        { upsert: true, new: true }
    );

    res.json({ success: true, combinedSummary: combined });
});

module.exports = { getQuestions, submit, getHistory, analyzeGemini };
