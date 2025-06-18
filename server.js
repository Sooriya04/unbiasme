require("dotenv").config();
require("./config/db");

const express = require("express");
const session = require("express-session");
const path = require("path");

// server
const app = express();
const port = process.env.PORT || 3000;

// MongoDB User model
const User = require("./models/user");

// MongoDB userverfication model
const userVerification = require("./models/userVerification");

/* -------------------- Middlewares -------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup in mongo db
const sessionMiddleware = require("./config/session");
app.use(sessionMiddleware);

// login or your account in navbar
app.use((req, res, next) => {
  res.locals.name = req.session.user?.name || null;
  next();
});

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static assets
app.use(express.static(path.join(__dirname, "public")));

/* -------------------- Routers -------------------- */
const userRouter = require("./api/User");
const questionsRouter = require("./api/questions");

app.use("/user", userRouter);
app.use("/quiz", questionsRouter);
/* -------------------- Page Routes -------------------- */

// Home
app.get("/", (req, res) => {
  res.render("pages/home");
});

// Auth pages
app.get("/login", (req, res) => res.render("pages/login"));
app.get("/signup", (req, res) => res.render("pages/signup"));

// Static content
app.get("/how-the-unbiasme-quiz-works", (req, res) =>
  res.render("content/unbiase")
);
app.get("/what-are-cognitive-biases", (req, res) => res.render("content/bias"));
app.get("/how-are-personality-and-bias-linked", (req, res) =>
  res.render("content/link")
);
app.get("/what-are-personality-traits", (req, res) =>
  res.render("content/traits")
);

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Quiz page
app.get("/quiz", (req, res) => {
  if (req.session.user) {
    const username = req.session.user.name;
    res.render("pages/quiz", { username });
  } else {
    res.redirect("/login");
  }
});

// Save trait scores from client
app.post("/quiz/submit-scores", async (req, res) => {
  const { traitScores } = req.body;
  const userEmail = req.session.user?.email;

  if (!userEmail) {
    res.status(401).render("error/error", {
      code: 401,
      message: "User not logged in",
    });
    //return res.status(401).json({ error: "User not logged in" });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { traitScores } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).render("error/error", {
        code: 404,
        message: "User not found",
      });
      //return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Trait scores saved successfully", user: updatedUser });
  } catch (err) {
    console.error("Error saving trait scores:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Failed to save scores",
    });
    //res.status(500).json({ error: "Failed to save scores" });
  }
});

// GET dashboard route
app.get("/dashboard", async (req, res) => {
  const userEmail = req.session.user?.email;

  if (!userEmail) return res.redirect("/login");

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.redirect("/login");

    res.render("pages/dashboard", {
      username: user.name || "User",
      traitScores: user.traitScores || {},
      user,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Error loading dashboard",
    });
    //res.status(500).send("Error loading dashboard");
  }
});

// POST /quiz/submit-scores route
app.post("/quiz/submit-scores", async (req, res) => {
  const { traitScores } = req.body;
  const userEmail = req.session.user?.email;

  if (!userEmail) {
    res.status(401).render("error/error", {
      code: 401,
      message: "User not logged in",
    });
    //return res.status(401).json({ error: "User not logged in" });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: userEmail },
      { $set: { traitScores } },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).render("error/error", {
        code: 404,
        message: "User not found",
      });
      //res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Trait scores saved successfully", user: updatedUser });
  } catch (err) {
    console.error("Error saving trait scores:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Failed to save scores",
    });
    //res.status(500).json({ error: "Failed to save scores" });
  }
});

//profile page
app.get("/profile", async (req, res) => {
  const email = req.session.user?.email;

  if (!email) return res.redirect("/login");

  const user = await User.findOne({ email });
  res.render("pages/profile", { user });
});

// profile post request(editing)
app.post("/profile/update", async (req, res) => {
  const { name, gender, dob, age } = req.body;
  const email = req.session.user?.email;

  if (!email) {
    res.status(401).render("error/error", {
      code: 401,
      message: "Unauthorized",
    });
    //return res.status(401).send("Unauthorized");
  }

  try {
    await User.updateOne({ email }, { name, gender, dob, age });
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Failed to update profile",
    });
    //res.status(500).send("Failed to update profile");
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).render("error/error", {
    message: "The page you’re looking for doesn’t exist.",
  });
});

// Start the server
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
