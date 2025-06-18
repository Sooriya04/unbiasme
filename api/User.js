const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const User = require("../models/user");
const UserVerification = require("../models/userVerification");

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
const APP_URL = process.env.APP_URL || "http://localhost:3000/"; // put in .env

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

  if (showPage) res.render("pages/verificationSent");
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

/*────────────────────────────  RENDER VERIFIED PAGE  ────────────────────────────*/
router.get("/verified", (req, res) => {
  res.render("pages/verification"); // success / fail handled in view via querystring
});

/*────────────────────────────  SIGN‑UP  ────────────────────────────*/
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  /* basic validation */
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

    await sendVerificationEmail(newUser, res); // finishes with ‘verificationSent’ page
  } catch (err) {
    console.error(err);
    res.status(500).render("error/error", { code: 500, message: "DB error" });
  }
});

/*────────────────────────────  SIGN‑IN  ────────────────────────────*/
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

    await sendVerificationEmail(user, res, false); // reuse function
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

module.exports = router;
