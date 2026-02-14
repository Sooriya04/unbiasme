const express = require("express");
const router = express.Router();
const dailyMCQController = require("../controllers/dailyMCQController");
const requireAuth = require("../middleware/auth");

router.get("/questions", requireAuth, dailyMCQController.getQuestions);
router.post("/submit", requireAuth, dailyMCQController.submit);
router.get("/history", requireAuth, dailyMCQController.getHistory);
router.post("/analyze", requireAuth, dailyMCQController.analyzeGemini);

module.exports = router;
