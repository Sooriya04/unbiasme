const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, dashboardController.getDashboard);
router.post("/generate-analysis", requireAuth, dashboardController.generateAnalysis);

module.exports = router;
