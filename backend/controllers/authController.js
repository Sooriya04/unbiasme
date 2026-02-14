const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const UserVerification = require("../models/userVerification");
const PasswordReset = require("../models/passwordReset");
const transporter = require("../services/mailService");
const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");

const APP_URL = process.env.APP_URL;

/* ═══════════════ HELPERS ═══════════════ */

async function sendVerificationEmail(user) {
    const uniqueString = uuidv4() + user._id;

    await new UserVerification({
        userId: user._id,
        uniqueString: await bcrypt.hash(uniqueString, 10),
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    }).save();

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: user.email,
        subject: "Verify your email — UnbiasMe",
        html: `
      <div style="max-width:600px;margin:0 auto;padding:40px 32px;font-family:'Segoe UI',Roboto,sans-serif;background:#f9f9f9;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.05)">
        <h2 style="color:#333;margin-bottom:24px">Hello, <span style="color:#212529">${user.name}</span></h2>
        <p style="font-size:16px;color:#555;line-height:1.6;margin-bottom:24px">
          Thank you for registering with <strong>UnbiasMe</strong>. Please confirm your email by clicking below.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${APP_URL}api/v1/auth/verify/${user._id}/${uniqueString}"
             style="background:#212529;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;display:inline-block">
            Confirm Email
          </a>
        </div>
        <p style="font-size:14px;color:#777">This link expires in <strong>6 hours</strong>.</p>
        <hr style="margin:32px 0;border:none;border-top:1px solid #eee"/>
        <p style="font-size:13px;color:#999;text-align:center">— The UnbiasMe Team</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
}

/* ═══════════════ SIGNUP ═══════════════ */

const signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (!/^[a-zA-Z ]+$/.test(name)) {
        return res.status(400).json({ success: false, message: "Invalid name" });
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be 8+ characters" });
    }

    if (await User.exists({ email })) {
        return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const newUser = await new User({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        verified: false,
        status: "justSignedUp",
    }).save();

    await sendVerificationEmail(newUser);

    res.status(201).json({
        success: true,
        message: "Account created. Please check your email to verify.",
    });
});

/* ═══════════════ SIGNIN ═══════════════ */

const signin = asyncHandler(async (req, res) => {
    const { email = "", password = "" } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.verified) {
        return res.status(403).json({
            success: false,
            message: "Email not verified. Please check your inbox.",
            needsVerification: true,
            email: user.email,
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    // Update status for greeting logic
    await User.findByIdAndUpdate(user._id, { status: "justSignedIn" });

    const token = generateToken(user);

    res.json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            status: "justSignedIn",
        },
    });
});

/* ═══════════════ GET ME ═══════════════ */

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");

    let greetingMessage = null;
    if (user.status === "justSignedUp") {
        greetingMessage = `Hi ${user.name}, ready to explore your mind today?`;
    } else if (user.status === "justSignedIn") {
        greetingMessage = `Welcome back, ${user.name}!`;
    }

    if (user.status) {
        user.status = null;
        await user.save();
    }

    res.json({ success: true, user, greetingMessage });
});

/* ═══════════════ VERIFY EMAIL ═══════════════ */

const verifyEmail = asyncHandler(async (req, res) => {
    const { userId, uniqueString } = req.params;
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    const record = await UserVerification.findOne({ userId });
    if (!record) {
        return res.redirect(`${FRONTEND_URL}/verified?status=fail&message=${encodeURIComponent("Link invalid or already verified.")}`);
    }

    if (record.expireAt < new Date()) {
        await UserVerification.deleteOne({ userId });
        await User.deleteOne({ _id: userId });
        return res.redirect(`${FRONTEND_URL}/verified?status=fail&message=${encodeURIComponent("Link expired. Please sign up again.")}`);
    }

    const match = await bcrypt.compare(uniqueString, record.uniqueString);
    if (!match) {
        return res.redirect(`${FRONTEND_URL}/verified?status=fail&message=${encodeURIComponent("Verification details incorrect.")}`);
    }

    await User.updateOne({ _id: userId }, { verified: true });
    await UserVerification.deleteOne({ userId });

    res.redirect(`${FRONTEND_URL}/verified?status=success`);
});

/* ═══════════════ RESEND VERIFICATION ═══════════════ */

const resendVerification = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.verified) {
        return res.status(400).json({ success: false, message: "Already verified" });
    }

    await sendVerificationEmail(user);
    res.json({ success: true, message: "Verification email sent" });
});

/* ═══════════════ REQUEST PASSWORD RESET ═══════════════ */

const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "No user found with this email" });
    }

    const resetString = uuidv4() + user._id;
    await PasswordReset.deleteMany({ userId: user._id });

    await new PasswordReset({
        userId: user._id,
        resetString: await bcrypt.hash(resetString, 10),
        createdAt: new Date(),
        expireAt: new Date(Date.now() + 3600000), // 1 hour
    }).save();

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: user.email,
        subject: "Password Reset — UnbiasMe",
        html: `
      <div style="max-width:600px;margin:0 auto;padding:40px 32px;font-family:'Segoe UI',sans-serif;">
        <h2>Reset your password</h2>
        <p>Click the button below. This link is valid for <strong>1 hour</strong>.</p>
        <a href="${FRONTEND_URL}/reset-password/${user._id}/${resetString}"
           style="display:inline-block;background:#212529;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>If you didn't request this, ignore this email.<br/><br/>— UnbiasMe Team</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Password reset link sent to your email" });
});

/* ═══════════════ RESET PASSWORD ═══════════════ */

const resetPassword = asyncHandler(async (req, res) => {
    const { userId, resetString } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const resetRecord = await PasswordReset.findOne({ userId });
    if (!resetRecord || resetRecord.expireAt < Date.now()) {
        return res.status(400).json({ success: false, message: "Reset link expired or invalid" });
    }

    const isMatch = await bcrypt.compare(resetString, resetRecord.resetString);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid reset link" });
    }

    await User.updateOne({ _id: userId }, { password: await bcrypt.hash(newPassword, 10) });
    await PasswordReset.deleteMany({ userId });

    res.json({ success: true, message: "Password reset successfully" });
});

module.exports = {
    signup,
    signin,
    getMe,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
};
