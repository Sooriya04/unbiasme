const express = require("express");
const router = express.Router();
const Data = require("../models/dataSchema");
const User = require("../models/user");
const { getGeminiAnalysis, generateContent } = require("../services/gemini");

/* helper: grab logged‑in user */
async function currentUser(req) {
  const email = req.session.user?.email;
  return email ? await User.findOne({ email }) : null;
}

/* -------- POST /quiz/submit-scores -------- */
router.post("/submit-scores", async (req, res) => {
  const traitScores = req.body.traitScores;
  if (!traitScores || typeof traitScores !== "object")
    return res.status(400).json({ message: "Invalid trait scores" });

  const user = await currentUser(req);
  if (!user) return res.status(401).json({ message: "Not logged in" });

  try {
    await Data.findOneAndUpdate(
      { userId: user._id },
      { $set: { traitScores } },
      { upsert: true, new: true }
    );
    res.json({ message: "Trait scores saved" });
  } catch (err) {
    console.error(" Save scores:", err);
    res.status(500).json({ message: "DB error saving trait scores" });
  }
});

/* -------- POST /quiz/analyze-gemini -------- */
router.post("/analyze-gemini", async (req, res) => {
  const traitScores = req.body.traitScores;
  const user = await currentUser(req);
  if (!user) return res.status(401).json({ message: "Not logged in" });

  try {
    /* fall back to DB scores if caller didn’t send them */
    const dataDoc =
      traitScores && Object.keys(traitScores).length
        ? null
        : await Data.findOne({ userId: user._id });

    const scores =
      traitScores && Object.keys(traitScores).length
        ? traitScores
        : dataDoc?.traitScores;

    if (!scores || Object.keys(scores).length === 0)
      return res.status(400).json({ message: "Trait scores missing" });

    const prompt = generateContent(scores);
    const geminiAnalysis = await getGeminiAnalysis(prompt);
    if (!geminiAnalysis)
      return res.status(500).json({ message: "Gemini returned invalid JSON" });

    await Data.findOneAndUpdate(
      { userId: user._id },
      { $set: { geminiAnalysis } },
      { upsert: true, new: true }
    );
    res.json({ message: "Gemini analysis saved" });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ message: "Gemini analysis failed" });
  }
});

module.exports = router;
