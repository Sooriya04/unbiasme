// UnbiasMe Backend — REST API Server

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const connectDB = require("./config/db");
const corsMiddleware = require("./config/cors");
const errorHandler = require("./middleware/errorHandler");

// Schedulers
const { startStoryScheduler, generateTodayOnce } = require("./schedulers/storyScheduler");
const startBiasScheduler = require("./schedulers/biasScheduler");
const startBiasCleanupScheduler = require("./schedulers/biasCleanup");
const initBiasGenerator = require("./start/biasInit");

// Route files
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const quizRoutes = require("./routes/quizRoutes");
const dailyMCQRoutes = require("./routes/dailyMCQRoutes");
const biasRoutes = require("./routes/biasRoutes");
const storyRoutes = require("./routes/storyRoutes");
const profileRoutes = require("./routes/profileRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

/* ─── Middleware ─── */
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─── API Routes ─── */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/daily-mcq", dailyMCQRoutes);
app.use("/api/v1/bias", biasRoutes);
app.use("/api/v1/story", storyRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/contact", contactRoutes);

/* ─── Health Check ─── */
app.get("/api/v1/health", (req, res) => {
    res.json({ success: true, message: "UnbiasMe API is running" });
});

/* ─── 404 Catch-All ─── */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

/* ─── Error Handler ─── */
app.use(errorHandler);

/* ─── Start Server ─── */
const startServer = async () => {
    try {
        await connectDB();

        // Initialize daily content
        await initBiasGenerator();
        generateTodayOnce().catch(err => console.error("Story init error:", err));

        // Start scheduled jobs
        startStoryScheduler();
        startBiasScheduler();
        startBiasCleanupScheduler();

        app.listen(PORT, () => {
            console.log(`\n✅ UnbiasMe API running on http://localhost:${PORT}\n`);
        });
    } catch (err) {
        console.error("❌ Server startup failed:", err);
        process.exit(1);
    }
};

startServer();
