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
// verifying
transporter.verify((error, success) => {
  if (error) {
    console.log("Nodemailer Error:", error);
  } else {
    console.log("Nodemailer is ready.");
  }
});

// sending email
const sendVerificationEmail = ({ _id, name, email }, res) => {
  const currentUrl = "http://localhost:3000/";
  const uniqueString = uuidv4() + _id;
  bcrypt.hash(uniqueString, 10).then((hashedUniqueString) => {
    const newVerification = new userVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 21600,
    });

    newVerification
      .save()
      .then(() => {
        const mailOptions = {
          from: process.env.AUTH_EMAIL,
          to: email,
          subject: "Verify your email",
          // Email to user for verification
          html: `
            <div
              style="
                max-width: 500px;
                margin: 30px auto;
                padding: 30px;
                border: 1px solid #eee;
                border-radius: 8px;
                font-family: Arial, sans-serif;
                text-align: center;
              "
            >
              <h2 style="color: #111; margin-bottom: 20px">Hello, ${name}</h2>
              <p style="color: #111; margin-bottom: 20px">Confirm your account</>
              <p style="color: #333; font-size: 15px; line-height: 1.5">
                Please click the button below to confirm your email address and finish
                setting up your account.<br />
                <b>This link is valid for 6 hours.</b>
              </p>
              <a
                href="${currentUrl}user/verify/${_id}/${uniqueString}"
                style="
                  display: inline-block;
                  outline: none;
                  cursor: pointer;
                  font-size: 16px;
                  line-height: 20px;
                  font-weight: 600;
                  border-radius: 8px;
                  padding: 13px 23px;
                  border: 1px solid #222222;
                  background: #ffffff;
                  color: #222222;
                  text-decoration: none;
                "
              >
                Confirm
              </a>

              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd" />
              <p style="color: #666; font-size: 13px">UnbiasMe</p>
            </div>
          `,
        };

        transporter
          .sendMail(mailOptions)
          .then(() => {
            res.render("pages/verificationSent");
            //res.json({ status: "Pending", message: "Verification email sent" });
          })
          .catch((err) => {
            console.log(`ERROR : ${err}`);
            res.status(500).render("error/error", {
              code: 500,
              message: "Failed to send email",
            });
            //res.json({ status: "Failed", message: "Failed to send email" });
          });
      })
      .catch((err) => {
        console.log(`ERROR : ${err}`);
        res.status(500).render("error/error", {
          code: 500,
          message: "Database error",
        });
        //res.status(500).json({ status: "Failed", message: "Database error" });
      });
  });
};
// --------------------------------- Verification Successful Routes ----------------------------------------
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
// rendering verification page
router.get("/verified", (req, res) => {
  res.render("../views/pages/verification");
});
// --------------------------------- Sign Up ----------------------------------------
router.post("/signup", (req, res) => {
  let name, email, password;

  if (req.body) {
    name = req.body.name;
    email = req.body.email;
    password = req.body.password;
  } else {
    //res.status(500).json({ status: "Failed", message: "Database error" });
    res.status(500).render("error/error", {
      code: 500,
      message: "No body found in request",
    });
    // return res.status(400).json({
    //   status: "Failed",
    //   message: "No body found in request",
    // });
  }

  if (!name || !email || !password) {
    return res.render("pages/signup", { error: "Invalid input" });
    //res.status(400).json({ status: "Failed", message: "Invalid input" });
  }

  if (!/^[a-zA-Z ]*$/.test(name)) {
    return res.render("pages/signup", { error: "Invalid input" });
    //res.status(400).json({ status: "Failed", message: "Invalid name" });
  }

  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.render("pages/signup", { error: "Invalid email" });
    //res.status(400).json({ status: "Failed", message: "Invalid email" });
  }

  if (password.length < 8) {
    return res.render("pages/signup", { error: "Password too short" });
    //res.status(400).json({ status: "Failed", message: "Password too short" });
  }

  User.find({ email }).then((result) => {
    if (result.length) {
      return res.render("pages/signup", { error: "Email already exists" });
      //return res.json({ status: "Failed", message: "Email already exists" });
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

// --------------------------------- Sign In ----------------------------------------
router.post("/signin", (req, res) => {
  let { email, password } = req.body;

  email = email?.trim();
  password = password?.trim();

  // Basic validation
  if (!email || !password) {
    return res.render("pages/login", { error: "Missing credentials" });
  }

  // Find user
  User.find({ email })
    .then((data) => {
      if (data.length === 0) {
        // User not found
        return res.render("pages/login", { error: "User not found" });
      }

      const user = data[0];

      // Check if user is verified
      if (!user.verified) {
        return res.render("error/error", {
          code: 403,
          message: "Email not verified. Please check your inbox.",
        });
      }

      // Compare password
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) {
            // Successful login
            req.session.user = {
              name: user.name,
              email: user.email,
            };
            return res.redirect("/");
          } else {
            // Incorrect password
            return res.render("pages/login", { error: "Incorrect password" });
          }
        })
        .catch((err) => {
          console.error("Bcrypt Error:", err);
          return res.status(500).render("error/error", {
            code: 500,
            message: "Something went wrong during password check",
          });
        });
    })
    .catch((err) => {
      console.error("MongoDB Error:", err);
      return res.status(500).render("error/error", {
        code: 500,
        message: "Database error",
      });
    });
});

module.exports = router;
