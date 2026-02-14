const transporter = require("../services/mailService");
const asyncHandler = require("../utils/asyncHandler");

/* ═══════════════ SUBMIT CONTACT FORM ═══════════════ */

const submitContact = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: process.env.AUTH_EMAIL,
        subject: "📩 New Contact Message from UnbiasMe",
        html: `
      <div style="font-family:Arial,sans-serif;font-size:16px;color:#333;padding:20px;">
        <h2 style="margin-bottom:16px;">New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color:#f2f2f2;padding:12px;border-radius:6px;white-space:pre-line;">${message}</p>
        <hr style="margin:30px 0;border:none;border-top:1px solid #ddd;"/>
        <p style="font-size:14px;color:#777;">Message sent from the UnbiasMe Contact Form.</p>
      </div>
    `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message sent successfully" });
});

module.exports = { submitContact };
