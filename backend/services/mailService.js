const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

transporter.verify((err) =>
    console.log(err ? "Nodemailer error: " + err : "✅ Mailer ready")
);

module.exports = transporter;
