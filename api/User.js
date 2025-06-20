const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const User = require("../models/user");
const UserVerification = require("../models/userVerification");
const passwordReset = require("../models/passwordReset");

const APP_URL = process.env.APP_URL;

/*────────────────────────────  MAIL TRANSPORT  ────────────────────────────*/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((err) =>
  console.log(err ? "Nodemailer error ➜" + err : "✓ Mailer ready")
);

/*────────────────────────────  HELPERS  ────────────────────────────*/

async function sendVerificationEmail(user, res, showPage = true) {
  const uniqueString = uuidv4() + user._id;

  const verificationDoc = new UserVerification({
    userId: user._id,
    uniqueString: await bcrypt.hash(uniqueString, 10),
    createdAt: new Date(),
    expireAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
  });

  await verificationDoc.save();

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email,
    subject: "Verify your email",
    html: `
      <div style="max-width:540px;margin:0 auto;padding:32px;font-family:Arial,sans-serif">
        <h2 style="margin-bottom:16px">Hi ${user.name},</h2>
        <p style="margin:8px 0 24px">
          Please confirm your email to activate your UnbiasMe account.
          <br><strong>This link is valid for 6 hours.</strong>
        </p>
        <a href="${APP_URL}user/verify/${user._id}/${uniqueString}"
           style="display:inline-block;background:#212529;color:#fff;
                  padding:12px 24px;border-radius:6px;text-decoration:none;">
          Confirm email
        </a>
        <p style="font-size:13px;margin-top:40px;color:#666">UnbiasMe Team</p>
      </div>`,
  };

  await transporter.sendMail(mailOptions);

  if (showPage) {
    res.render("pages/verificationSent", { email: user.email });
  }
}

/*──────────────────────────── VERIFY ────────────────────────────*/
router.get("/verify/:userId/:uniqueString", async (req, res) => {
  try {
    const { userId, uniqueString } = req.params;
    const record = await UserVerification.findOne({ userId });

    if (!record)
      return res.redirect(
        `/user/verified?status=fail&message=${encodeURIComponent(
          "Link invalid or account already verified."
        )}`
      );

    if (record.expireAt < new Date()) {
      await UserVerification.deleteOne({ userId });
      await User.deleteOne({ _id: userId });
      return res.redirect(
        `/user/verified?status=fail&message=${encodeURIComponent(
          "Link expired. Please sign‑up again."
        )}`
      );
    }

    const match = await bcrypt.compare(uniqueString, record.uniqueString);
    if (!match)
      return res.redirect(
        `/user/verified?status=fail&message=${encodeURIComponent(
          "Verification details incorrect."
        )}`
      );

    await User.updateOne({ _id: userId }, { verified: true });
    await UserVerification.deleteOne({ userId });
    res.redirect("/user/verified?status=success");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error/error", { code: 500, message: "Server error" });
  }
});

/*──────────────────────────── VERIFIED PAGE ────────────────────────────*/
router.get("/verified", (req, res) => {
  res.render("pages/verification");
});

/*──────────────────────────── SIGNUP ────────────────────────────*/
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password)
    return res.render("pages/signup", { error: "All fields are required" });

  if (!/^[a-zA-Z ]+$/.test(name))
    return res.render("pages/signup", { error: "Invalid name" });

  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
    return res.render("pages/signup", { error: "Invalid email" });

  if (password.length < 8)
    return res.render("pages/signup", { error: "Password must be 8+ chars" });

  try {
    if (await User.exists({ email }))
      return res.render("pages/signup", { error: "Email already exists" });

    const newUser = await new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      verified: false,
    }).save();

    await sendVerificationEmail(newUser, res);
  } catch (err) {
    console.error(err);
    res.status(500).render("error/error", { code: 500, message: "DB error" });
  }
});

/*──────────────────────────── SIGNIN ────────────────────────────*/
router.post("/signin", async (req, res) => {
  const { email = "", password = "" } = req.body;

  if (!email || !password)
    return res.render("pages/login", { error: "Missing credentials" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.render("pages/login", { error: "User not found" });

    if (!user.verified)
      return res.render("error/resend", {
        email: user.email,
        message: "Email not verified. Please check your inbox.",
      });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.render("pages/login", { error: "Incorrect password" });

    req.session.user = { name: user.name, email: user.email };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error/error", { code: 500, message: "Server error" });
  }
});

/*──────────────────────────── RESEND VERIFICATION ────────────────────────────*/
router.get("/resend-verification/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user)
      return res.render("error/error", {
        code: 404,
        message: "User not found",
      });

    if (user.verified)
      return res.render("error/error", {
        code: 400,
        message: "Already verified",
      });

    await sendVerificationEmail(user, res, false);
    res.render("pages/verificationSent", {
      info: "A fresh verification link has been emailed to you.",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error/error", { code: 500, message: "Server error" });
  }
});

/*──────────────────────────── PASSWORD RESET ────────────────────────────*/
router.post("/passwordReset", async (req, res) => {
  const { email, redirectUrl } = req.body;

  if (!email || !redirectUrl) {
    return res.status(400).render("error/error", {
      code: 400,
      message: "Missing email or redirect URL",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).render("error/error", {
        code: 404,
        message: "No user found with this email",
      });
    }

    const resetString = uuidv4() + user._id;
    await passwordReset.deleteMany({ userId: user._id });

    const hashedResetString = await bcrypt.hash(resetString, 10);

    const newReset = new passwordReset({
      userId: user._id,
      resetString: hashedResetString,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 3600000),
    });

    await newReset.save();

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: user.email,
      subject: "Password Reset - UnbiasMe",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 32px; font-family: 'Segoe UI', sans-serif;">
          <h2>Reset your password</h2>
          <p>Click the button below. This link is valid for <strong>1 hour</strong>.</p>
          <a href="${redirectUrl}/user/reset-password/${user._id}/${resetString}"
            style="display: inline-block; background-color: #212529; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>If you didn’t request this, ignore this email.<br /><br />— UnbiasMe Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.render("error/resetPage", {
      info: "A password reset link has been sent to your email.",
    });
  } catch (err) {
    console.error("Error during password reset request:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Failed to send reset email",
    });
  }
});

/*──────────────────────────── RESET PASSWORD PAGE ────────────────────────────*/
router.get("/reset-password/:userId/:resetString", async (req, res) => {
  const { userId, resetString } = req.params;

  try {
    const resetRecord = await passwordReset.findOne({ userId });
    if (!resetRecord || resetRecord.expireAt < Date.now()) {
      return res.render("error/error", {
        code: 400,
        message: "Reset link expired or invalid",
      });
    }

    const isMatch = await bcrypt.compare(resetString, resetRecord.resetString);
    if (!isMatch) {
      return res.render("error/error", {
        code: 401,
        message: "Reset link is invalid",
      });
    }

    res.render("pages/reset-password", { userId, resetString });
  } catch (err) {
    console.error("Error loading reset page:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Server error",
    });
  }
});

/*──────────────────────────── RESET PASSWORD SUBMIT ────────────────────────────*/
router.post("/reset-password/:userId/:resetString", async (req, res) => {
  const { userId, resetString } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).render("pages/reset-password", {
      error: "All fields are required.",
      userId,
      resetString,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).render("pages/reset-password", {
      error: "Passwords do not match.",
      userId,
      resetString,
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).render("pages/reset-password", {
      error: "Password must be at least 8 characters",
      userId,
      resetString,
    });
  }

  try {
    const resetRecord = await passwordReset.findOne({ userId });
    if (!resetRecord || resetRecord.expireAt < Date.now()) {
      return res.render("error/error", {
        code: 400,
        message: "Reset link expired or invalid.",
      });
    }

    const isMatch = await bcrypt.compare(resetString, resetRecord.resetString);
    if (!isMatch) {
      return res.render("error/error", {
        code: 400,
        message: "Invalid reset link.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: userId }, { password: hashedPassword });
    await passwordReset.deleteMany({ userId });

    res.redirect("/login");
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Server error",
    });
  }
});

module.exports = router;
