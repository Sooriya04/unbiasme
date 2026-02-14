const mongoose = require("mongoose");
const Data = require("../models/dataSchema");
const User = require("../models/user");
const { getGeminiAnalysis, generateContent } = require("../services/gemini");
const asyncHandler = require("../utils/asyncHandler");

const fs = require("fs");
const path = require("path");

/* ═══════════════ GET QUESTIONS ═══════════════ */

const getQuestions = asyncHandler(async (req, res) => {
    try {
        const filePath = path.join(__dirname, "../docs/questions.json");
        const fileData = fs.readFileSync(filePath, "utf-8");
        const questions = JSON.parse(fileData).map((q, i) => ({ ...q, _id: `q${i}` }));
        res.json({ success: true, questions });
    } catch (error) {
        console.error("Error reading questions.json:", error);
        res.status(500).json({ success: false, message: "Failed to load questions" });
    }
});

/* ═══════════════ SUBMIT SCORES ═══════════════ */

const submitScores = asyncHandler(async (req, res) => {
    const { traitScores } = req.body;
    if (!traitScores || typeof traitScores !== "object") {
        return res.status(400).json({ success: false, message: "Invalid trait scores" });
    }

    await Data.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { traitScores } },
        { upsert: true, new: true }
    );

    res.json({ success: true, message: "Trait scores saved" });
});

/* ═══════════════ ANALYZE GEMINI ═══════════════ */

const analyzeGemini = asyncHandler(async (req, res) => {
    let { traitScores } = req.body;

    if (!traitScores || Object.keys(traitScores).length === 0) {
        const dataDoc = await Data.findOne({ userId: req.user._id });
        traitScores = dataDoc?.traitScores;
    }

    if (!traitScores || Object.keys(traitScores).length === 0) {
        return res.status(400).json({ success: false, message: "Trait scores missing" });
    }

    const prompt = generateContent(traitScores);
    const geminiAnalysis = await getGeminiAnalysis(prompt);

    if (!geminiAnalysis) {
        return res.status(500).json({ success: false, message: "Gemini returned invalid response" });
    }

    await Data.findOneAndUpdate(
        { userId: req.user._id },
        { $set: { geminiAnalysis } },
        { upsert: true, new: true }
    );

    res.json({ success: true, message: "Gemini analysis saved" });
});

module.exports = { getQuestions, submitScores, analyzeGemini };
