// routes/user.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const User = require("../models/user");
const userVerification = require("../models/userVerification");

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Nodemailer Error:", error);
  } else {
    console.log("Nodemailer is ready.");
  }
});

const sendVerificationEmail = ({ _id, email }, res) => {
  const currentUrl = "http://localhost:3000/";
  const uniqueString = uuidv4() + _id;

  bcrypt.hash(uniqueString, 10).then((hashedUniqueString) => {
    const newVerification = new userVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 21600000, // 6 hours
    });

    newVerification
      .save()
      .then(() => {
        const mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: email,
          subject: "Verify your email",
          html: `
            <p>Verify your email to complete signup.</p>
            <p>This link <b>expires in 6 hours</b>.</p>
            <p>Click <a href="${currentUrl}user/verify/${_id}/${uniqueString}">here</a> to verify.</p>
          `,
        };

        transporter
          .sendMail(mailOptions)
          .then(() => {
            res.render("pages/verificationSent");
            //res.json({ status: "Pending", message: "Verification email sent" });
          })
          .catch((err) => {
            res.json({ status: "Failed", message: "Failed to send email" });
          });
      })
      .catch((err) => {
        res.json({ status: "Failed", message: "Database error" });
      });
  });
};

router.get("/verify/:userId/:uniqueString", (req, res) => {
  const { userId, uniqueString } = req.params;

  userVerification.find({ userId }).then((result) => {
    if (result.length > 0) {
      const { expireAt, uniqueString: hashedUniqueString } = result[0];

      if (expireAt < Date.now()) {
        userVerification.deleteOne({ userId }).then(() => {
          User.deleteOne({ _id: userId }).then(() => {
            res.redirect(
              `/user/verified?status=fail&message=${encodeURIComponent(
                "Link expired. Sign up again."
              )}`
            );
          });
        });
      } else {
        bcrypt.compare(uniqueString, hashedUniqueString).then((isMatch) => {
          if (isMatch) {
            User.updateOne({ _id: userId }, { verified: true }).then(() => {
              userVerification.deleteOne({ userId }).then(() => {
                res.redirect(`/user/verified?status=success`);
              });
            });
            console.log("Verified Successfully");
          } else {
            res.redirect(
              `/user/verified?status=fail&message=${encodeURIComponent(
                "Invalid verification details"
              )}`
            );
          }
        });
      }
    } else {
      res.redirect(
        `/user/verified?status=fail&message=${encodeURIComponent(
          "Account not found or already verified."
        )}`
      );
    }
  });
});

router.get("/verified", (req, res) => {
  res.render("../views/pages/verification");
});

router.post("/signup", (req, res) => {
  let name, email, password;

  if (req.body) {
    name = req.body.name;
    email = req.body.email;
    password = req.body.password;
  } else {
    return res.status(400).json({
      status: "Failed",
      message: "No body found in request",
    });
  }

  if (!name || !email || !password) {
    return res.json({ status: "Failed", message: "Invalid input" });
  }

  if (!/^[a-zA-Z ]*$/.test(name)) {
    return res.json({ status: "Failed", message: "Invalid name" });
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.json({ status: "Failed", message: "Invalid email" });
  }

  if (password.length < 8) {
    return res.json({ status: "Failed", message: "Password too short" });
  }

  User.find({ email }).then((result) => {
    if (result.length) {
      return res.json({ status: "Failed", message: "Email already exists" });
    } else {
      bcrypt.hash(password, 10).then((hashedPassword) => {
        const newUser = new User({
          name,
          email,
          password: hashedPassword,
          verified: false,
        });

        newUser.save().then((result) => {
          sendVerificationEmail(result, res);
        });
      });
    }
  });
});

router.post("/signin", (req, res) => {
  let { email, password } = req.body;
  email = email?.trim();
  password = password?.trim();

  if (!email || !password) {
    return res.json({ status: "Failed", message: "Missing credentials" });
  }

  User.find({ email }).then((data) => {
    if (data.length === 0) {
      return res.json({ status: "Failed", message: "User not found" });
    }

    const user = data[0];

    if (!user.verified) {
      return res.json({ status: "Failed", message: "Email not verified" });
    }

    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        req.session.user = {
          name: user.name,
          email: user.email,
        };
        res.redirect("/");
      } else {
        res.json({ status: "Failed", message: "Incorrect password" });
      }
    });
  });
});

module.exports = router;
