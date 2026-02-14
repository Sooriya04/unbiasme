const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const requireAuth = require("../middleware/auth");

router.get("/questions", requireAuth, quizController.getQuestions);
router.post("/submit-scores", requireAuth, quizController.submitScores);
router.post("/analyze-gemini", requireAuth, quizController.analyzeGemini);

module.exports = router;
