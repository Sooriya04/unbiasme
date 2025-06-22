const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const User = require("../models/user");
const UserVerification = require("../models/userVerification");
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

/** Send (or re‑send) a verification email */
async function sendVerificationEmail(user, res, showPage = true) {
  const uniqueString = uuidv4() + user._id;

  // store a fresh verification doc
  const verificationDoc = new UserVerification({
    userId: user._id,
    uniqueString: await bcrypt.hash(uniqueString, 10),
    createdAt: new Date(),
    expireAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
  });

  await verificationDoc.save();

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email,
    subject: "Verify your email",
    html: `
      <div
        style="
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 32px;
          font-family: 'Segoe UI', Roboto, sans-serif;
          background-color: #f9f9f9;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        "
      >
        <h2 style="color: #333; margin-bottom: 24px">
          Hello, <span style="color: #212529">${user.name}</span>
        </h2>

        <p
          style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px"
        >
          Thank you for registering with <strong>UnbiasMe</strong>. To complete your
          sign-up, please confirm your email address by clicking the button below.
        </p>

        <div style="text-align: center; margin: 32px 0">
          <a
            href="${APP_URL}user/verify/${user._id}/${uniqueString}"
            style="
              background-color: #212529;
              color: #ffffff;
              padding: 14px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              font-size: 16px;
              display: inline-block;
            "
          >
           Confirm Email
          </a>
        </div>

        <p style="font-size: 14px; color: #777">
          This link will expire in <strong>6 hours</strong>. If you did not create
          this account, you can safely ignore this message.
        </p>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee" />

        <p style="font-size: 13px; color: #999; text-align: center">
          Need help? Contact us at
          <a href="mailto:support@unbiasme.com" style="color: #666"
            >support@unbiasme.com</a
          >
          <br /><br />— The UnbiasMe Team
        </p>
      </div>
  
    `,
  };

  await transporter.sendMail(mailOptions);

  if (showPage) {
    return res.render("mails/verificationSent", { email: user.email });
  }
}

/*────────────────────────────  VERIFY  ────────────────────────────*/
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

// ───────────────────── GREETING PAGE ─────────────────────
router.get("/greeting", async (req, res) => {
  const userId = req.session.user?._id;
  if (!userId) return res.redirect("/user/login");

  const user = await User.findById(userId);
  let greetingMessage = "";

  if (user.status === "justSignedUp") {
    greetingMessage = `Hi ${user.name}, ready to explore your mind today?`;
  } else if (user.status === "justSignedIn") {
    greetingMessage = `Welcome back, ${user.name}!`;
  } else {
    greetingMessage = `Hello again, ${user.name}.`;
  }

  user.status = null;
  await user.save();

  res.render("pages/greeting", {
    name: user.name,
    greetingMessage,
  });
});
// ───────────────────── VERIFIED PAGE ─────────────────────
router.get("/verified", (req, res) => {
  res.render("mails/verification"); // uses status from query string
});
/*────────────────────────────  SIGN‑UP  ────────────────────────────*/
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
      status: "justSignedUp",
    }).save();

    // Save session
    req.session.user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };

    // Send email and show verification page
    await sendVerificationEmail(newUser, res, true); // true = show verificationSent.ejs
  } catch (err) {
    console.error(err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Something went wrong during signup",
    });
  }
});

/*────────────────────────────  SIGN‑IN  ────────────────────────────*/
router.post("/signin", async (req, res) => {
  const { email = "", password = "" } = req.body;
  if (!email || !password) {
    return res.render("pages/login", { error: "Missing credentials" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("pages/login", { error: "User not found" });
    }

    if (!user.verified) {
      return res.render("mails/resend", {
        email: user.email,
        message: "Email not verified. Please check your inbox.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.render("pages/login", { error: "Incorrect password" });
    }

    // Store user in session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    // Update status for greeting logic
    await User.findByIdAndUpdate(user._id, { status: "justSignedIn" });

    // Save session and redirect
    req.session.save(() => {
      res.redirect("/user/greeting");
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Internal server error during login",
    });
  }
});

/*────────────────────────────  RESEND VERIFICATION  ────────────────────────────*/
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
    res.render("mails/verificationSent", {
      email: user.email,
      info: "New verification link sent.",
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .render("error/error", { code: 500, message: "Server error" });
  }
});

/*────────────────────────────  PASSWORD RESET  ────────────────────────────*/
const passwordReset = require("../models/passwordReset");

/*──────────────────────────── SEND RESET EMAIL ────────────────────────────*/
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

    res.render("mails/resetPage", {
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

/*──────────────────────────── RESET PAGE (GET) ────────────────────────────*/
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

    res.render("mails/reset-password", { userId, resetString });
  } catch (err) {
    console.error("Error loading reset page:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Server error",
    });
  }
});

/*──────────────────────────── HANDLE RESET SUBMIT ────────────────────────────*/
router.post("/reset-password/:userId/:resetString", async (req, res) => {
  const { userId, resetString } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).render("mails/reset-password", {
      error: "All fields are required.",
      userId,
      resetString,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).render("mails/reset-password", {
      error: "Passwords do not match.",
      userId,
      resetString,
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).render("mails/reset-password", {
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
