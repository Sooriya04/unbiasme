const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const requireAuth = require("../middleware/auth");

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.get("/me", requireAuth, authController.getMe);
router.get("/verify/:userId/:uniqueString", authController.verifyEmail);
router.get("/resend-verification/:email", authController.resendVerification);
router.post("/password-reset", authController.requestPasswordReset);
router.post("/reset-password/:userId/:resetString", authController.resetPassword);

module.exports = router;
