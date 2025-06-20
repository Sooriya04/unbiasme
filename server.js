require("dotenv").config();
require("./config/db");
const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const User = require("./models/user");
const Data = require("./models/dataSchema");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const sessionMiddleware = require("./config/session");
app.use(sessionMiddleware);

app.use((req, res, next) => {
  res.locals.name = req.session.user?.name || null;
  next();
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const userRouter = require("./api/User");
const questionsRouter = require("./api/questions");

app.use("/user", userRouter);
app.use("/quiz", questionsRouter);

const { getGeminiAnalysis, generateContent } = require("./util/genai");

// Home Routes
app.get("/", (req, res) => res.render("pages/home"));
app.get("/login", (req, res) => res.render("pages/login"));
app.get("/signup", (req, res) => res.render("pages/signup"));

// Static Pages
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

// Quiz
app.get("/quiz", (req, res) => {
  if (req.session.user) {
    const username = req.session.user.name;
    res.render("pages/quiz", { username });
  } else {
    res.redirect("/login");
  }
});

// Dashboard
app.get("/dashboard", async (req, res) => {
  const userEmail = req.session.user?.email;
  if (!userEmail) return res.redirect("/login");

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.redirect("/login");

    const data = await Data.findOne({ userId: user._id });

    res.render("pages/dashboard", {
      username: user.name || "User",
      user,
      geminiData: data?.geminiAnalysis || null,
      missingTraitScores:
        !data ||
        !data.traitScores ||
        Object.keys(data.traitScores).length === 0,
      analysisPending: !data?.geminiAnalysis || !data.geminiAnalysis.summary,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Error loading dashboard",
    });
  }
});
app.post("/generate-analysis", async (req, res) => {
  const userEmail = req.session.user?.email;
  if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    let data = await Data.findOne({ userId: user._id });
    if (!data || !data.traitScores) {
      return res.status(400).json({ error: "Trait scores not found" });
    }

    // Already has data
    if (
      data.geminiAnalysis &&
      data.geminiAnalysis.summary &&
      data.geminiAnalysis.biases?.length &&
      data.geminiAnalysis.workplace?.environment
    ) {
      return res.json({ success: true, geminiData: data.geminiAnalysis });
    }

    // Generate new Gemini analysis
    const prompt = generateContent(data.traitScores);
    const aiResponse = await getGeminiAnalysis(prompt);

    if (aiResponse) {
      data.geminiAnalysis = aiResponse;
      await data.save();
      return res.json({ success: true, geminiData: aiResponse });
    } else {
      return res.status(500).json({ error: "Failed to generate analysis" });
    }
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Store Trait Scores (only in Data collection)
app.post("/quiz/submit-scores", async (req, res) => {
  const { traitScores } = req.body;
  const userEmail = req.session.user?.email;

  if (!userEmail) {
    return res.status(401).render("error/error", {
      code: 401,
      message: "User not logged in",
    });
  }

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).render("error/error", {
        code: 404,
        message: "User not found",
      });
    }

    let data = await Data.findOne({ userId: user._id });

    if (!data) {
      data = new Data({ userId: user._id, traitScores });
    } else {
      data.traitScores = traitScores;
    }

    await data.save();

    res.json({ message: "Trait scores saved successfully" });
  } catch (err) {
    console.error("Error saving trait scores:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Failed to save trait scores",
    });
  }
});

// Profile Pages
app.get("/profile", async (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.redirect("/login");

  const user = await User.findOne({ email });
  res.render("pages/profile", { user });
});

app.post("/profile/update", async (req, res) => {
  const { name, gender, dob, age } = req.body;
  const email = req.session.user?.email;

  if (!email) {
    return res.status(401).render("error/error", {
      code: 401,
      message: "Unauthorized",
    });
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
  }
});

// Password Reset Flow
app.get("/passwordReset", (req, res) => res.render("mails/enter-email"));
app.get("/enter-email", (req, res) => res.render("mails/enter-email"));

app.get("/user/reset-password/:userId/:resetString", async (req, res) => {
  const { userId, resetString } = req.params;

  try {
    const resetRecord = await require("./models/passwordReset").findOne({
      userId,
    });
    if (!resetRecord) {
      return res.render("error/error", {
        code: 400,
        message: "Invalid or expired reset link",
      });
    }

    const match = await bcrypt.compare(resetString, resetRecord.resetString);
    if (!match) {
      return res.render("error/error", {
        code: 401,
        message: "Reset link is invalid",
      });
    }

    res.render("mails/reset-password", { userId, resetString });
  } catch (err) {
    console.error("Reset page error:", err);
    res.status(500).render("error/error", {
      code: 500,
      message: "Server error",
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).render("error/error", {
    code: 404,
    message: "The page you’re looking for doesn’t exist.",
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
