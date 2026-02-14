const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const requireAuth = require("../middleware/auth");

router.get("/", requireAuth, profileController.getProfile);
router.put("/", requireAuth, profileController.updateProfile);

module.exports = router;
