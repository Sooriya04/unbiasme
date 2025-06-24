const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

/*──────────── MAILER SETUP ────────────*/
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((err) =>
  console.log(err ? "Nodemailer error ➜ " + err : "✓ Contact Mailer ready")
);

/*──────────── GET /contact – render the form ────────────*/
router.get("/", (req, res) => {
  res.render("pages/contact", {
    isLoggedIn: !!req.session.user,
    name: req.session.user?.name || null,
  });
});

/*──────────── POST /contact – send email ────────────*/
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).render("error/error", {
      code: 400,
      message: "All fields are required",
    });
  }

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: process.env.AUTH_EMAIL,
    subject: `📩 New Contact Message from UnbiasMe`,
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; padding: 20px;">
        <h2 style="margin-bottom: 16px;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color: #f2f2f2; padding: 12px; border-radius: 6px; white-space: pre-line;">
          ${message}
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 14px; color: #777;">
          Message sent from the UnbiasMe Contact Form.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render("pages/contact", { name });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Failed to send message. Please try again later.",
    });
  }
});

module.exports = router;
