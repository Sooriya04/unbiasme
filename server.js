// UnbiasMe server.js

require("dotenv").config();
require("./config/db");
require("./config/cron");
const {
  startStoryScheduler,
  generateTodayOnce,
} = require("./scheduler/storyScheduler");

startStoryScheduler();
generateTodayOnce();
const startBiasCleanupScheduler = require("./scheduler/biasCleanup");
startBiasCleanupScheduler();

const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;
const User = require("./models/user");
const Data = require("./models/dataSchema");
mongoose.set("strictQuery", true);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const generateTodayBiasIfNeeded = require("./helpers/generateTodayBiasIfNeeded");
const sessionMiddleware = require("./config/session");
app.use(sessionMiddleware);

app.use((req, res, next) => {
  res.locals.name = req.session.user?.name || null;
  next();
});
const initBiasGenerator = require("./start/biasInit");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const userRouter = require("./routes/User");
const questionsRouter = require("./routes/questions");
const quizRoutes = require("./routes/quiz");
app.use("/quiz", quizRoutes);

app.use("/user", userRouter);
app.use("/quiz", questionsRouter);

const { getGeminiAnalysis, generateContent } = require("./services/gemini");

/* ─── Daily‑MCQ imports ─── */
const DailyMCQQuestionSet = require("./models/dailyMCQQuestionSet");
const { DailyMCQEntry, DailyMCQSummary } = require("./models/dailyMCQEntry");
const generateDailyMCQQuestions = require("./services/generateDailyMCQQuestions");
const generateDailySummary = require("./services/generateDailySummary");

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.user;
  res.locals.name = req.session.user?.name || null;
  next();
});
// Home Routes
app.get("/", async (req, res) => {
  const greetingMessage = req.session.greetingMessage;
  delete req.session.greetingMessage;

  res.render("pages/home", { greetingMessage });
});
// Daily Bias learn card
const biasRoute = require("./routes/bias");
app.use("/", biasRoute);
// Contact US
const contactRoute = require("./routes/contact");
app.use("/contact", contactRoute);

// About US
app.get("/about", (req, res) => {
  res.render("pages/about", {
    isLoggedIn: !!req.session.user,
    name: req.session.user?.name || null,
  });
});

// LOGIN ROUTE
app.get("/login", (req, res) => res.render("pages/login"));
//SIGNUP ROUTE
app.get("/signup", (req, res) => res.render("pages/signup"));

// Static Pages
app.get("/how-the-unbiasme-quiz-works", (req, res) =>
  res.render("static/unbiase")
);
app.get("/what-are-cognitive-biases", (req, res) => res.render("static/bias"));
app.get("/how-are-personality-and-bias-linked", (req, res) =>
  res.render("static/link")
);
app.get("/what-are-personality-traits", (req, res) =>
  res.render("static/traits")
);

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Story
const storyRoute = require("./routes/stroyRoute");
app.use("/", storyRoute);

// Quiz
app.get("/quiz", (req, res) => {
  if (req.session.user) {
    const username = req.session.user.name;
    res.render("pages/quiz", { username });
  } else {
    res.redirect("/login");
  }
});

/* ------------ dashboard ------------ */

app.get("/dashboard", async (req, res) => {
  if (!req.session.user?.email) return res.redirect("/login");
  try {
    const user = await User.findOne({ email: req.session.user.email });
    if (!user) throw new Error("User not found");

    const data = await Data.findOne({ userId: user._id });

    const quizHistoryRaw = await DailyMCQEntry.find({ userId: user._id })
      .sort({ date: 1 })
      .limit(7)
      .lean();

    const quizHistory = quizHistoryRaw.slice(-7);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const hasTodayQuiz = quizHistory.some((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    res.render("pages/dashboard", {
      username: user.name || "User",
      user,
      geminiData: data?.geminiAnalysis || null,
      traitScores: data?.traitScores || {},
      missingTraitScores:
        !data?.traitScores || Object.keys(data.traitScores).length === 0,
      analysisPending: !data?.geminiAnalysis?.summary,
      quizHistory,
      hasTodayQuiz, // NEW
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res
      .status(500)
      .render("error/error", { code: 500, message: "Dashboard error" });
  }
});

/* ------------ generate-analysis using gemini ------------ */
app.post("/generate-analysis", async (req, res) => {
  const userEmail = req.session.user?.email;
  if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ error: "User not found" });

    const data = await Data.findOne({ userId: user._id });

    if (
      !data ||
      !data.traitScores ||
      Object.keys(data.traitScores).length === 0
    ) {
      return res.status(400).json({ error: "Trait scores not found" });
    }

    // Always regenerate Gemini analysis on request
    const prompt = generateContent(data.traitScores);
    const aiResponse = await getGeminiAnalysis(prompt);

    if (aiResponse) {
      data.geminiAnalysis = aiResponse;
      await data.save();
      console.log("Result is generated");
      return res.json({ success: true, geminiData: aiResponse });
    } else {
      return res.status(500).json({ error: "Failed to generate analysis" });
    }
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Store Trait Scores in DB
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

// Updating the profile
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

// Password Reset route
app.get("/passwordReset", (req, res) => res.render("mails/enter-email"));
app.get("/enter-email", (req, res) => res.render("mails/enter-email"));

//password reset
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

/* GET DailyMCQ questions questions */
app.get("/dailyMCQ/questions", async (req, res) => {
  const userEmail = req.session.user?.email;
  if (!userEmail) return res.status(401).json({ message: "Not logged in" });

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toISOString().split("T")[0];

    const existingEntry = await DailyMCQEntry.findOne({
      userId: user._id,
      date: today,
    });

    if (existingEntry) {
      return res.json({
        alreadySubmitted: true,
        summary: existingEntry.summary,
      });
    }
    let qsDoc = await DailyMCQQuestionSet.findOne({
      userId: user._id,
      date: today,
    });

    if (!qsDoc) {
      const questions = await generateDailyMCQQuestions();
      qsDoc = await DailyMCQQuestionSet.create({
        userId: user._id,
        date: today,
        questions,
      });
    }

    res.json(qsDoc.questions);
  } catch (err) {
    console.error("  /dailyMCQ/questions error:", err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

/* POST summary for daily MCQ */
app.post("/dailyMCQ/submit", async (req, res) => {
  const { questions } = req.body;
  const email = req.session.user?.email;
  if (!email || !Array.isArray(questions) || questions.length !== 3)
    return res.status(400).json({ message: "Bad payload" });

  try {
    const user = await User.findOne({ email });
    const today = new Date().toISOString().split("T")[0];

    if (await DailyMCQEntry.exists({ userId: user._id, date: today }))
      return res.json({ alreadySubmitted: true, message: "See you tomorrow!" });

    const totalScore = questions.reduce((s, q) => s + (q.userScore || 0), 0);
    const summary = await generateDailySummary(questions);
    console.log("Summary:", summary);

    await DailyMCQEntry.create({
      userId: user._id,
      date: today,
      questions,
      totalScore,
      summary,
    });

    res.json({ summary });
  } catch (e) {
    console.error("/dailyMCQ/submit:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/* POST combined summary */
app.post("/dailyMCQ/analyze-gemini", async (req, res) => {
  const email = req.session.user?.email;
  if (!email) return res.status(401).json({ message: "Not logged in" });

  try {
    const user = await User.findOne({ email });
    const entries = await DailyMCQEntry.find({ userId: user._id }).sort({
      date: 1,
    });
    if (!entries.length)
      return res.status(400).json({ message: "No entries yet" });

    const prompt = entries
      .map((e) => `Date ${e.date}: ${e.summary}`)
      .join("\n\n");
    const combined = await generateDailySummary([
      {
        text: prompt,
        options: { A: "", B: "", C: "", D: "", E: "" },
        userAnswer: "A",
        userScore: 0,
      },
    ]);

    await DailyMCQSummary.findOneAndUpdate(
      { userId: user._id },
      { combinedSummary: combined, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ combinedSummary: combined });
  } catch (e) {
    console.error("/dailyMCQ/analyze-gemini:", e);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─────────────── Daily MCQ ─────────────── */
app.get("/dailyMCQ", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("pages/dailyMCQ", { username: req.session.user.name });
});
/* ─────────────── Sending Summary to Dashboard ─────────────── */
function requireLogin(req, res, next) {
  if (req.session?.user?.email) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

app.get("/dailyMCQ/history", requireLogin, async (req, res) => {
  const user = await User.findOne({ email: req.session.user.email });
  const entries = await DailyMCQEntry.find({ userId: user._id })
    .sort({ date: 1 })
    .select("date totalScore summary -_id");
  res.json(entries);
});

/* ─────────────── 404 CATCH‑ALL ─────────────── */
app.use((req, res) => {
  res.status(404).render("error/error", {
    code: 404,
    message: "The page you’re looking for doesn’t exist.",
  });
});

/* ─────────────── START SERVER ─────────────── */
app.listen(port, async () => {
  await initBiasGenerator();
  console.log(`Server running on http://localhost:${port}`);
});
