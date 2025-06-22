const { GoogleGenerativeAI } = require("@google/generative-ai");
const { DailyMCQSummary } = require("../models/dailyMCQEntry");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = async (questions, userId) => {
  const body = questions
    .map(
      (q, i) =>
        `Q${i + 1}: ${q.text}\nAnswer: ${q.options[q.userAnswer]} (Score: ${
          q.userScore
        })`
    )
    .join("\n\n");

  const prompt = `
You're a helpful psychologist.
Reflect on these answers and write a short encouraging 2-3 sentence summary that gently highlights the user's mindset and self-awareness.

${body}
`;

  try {
    const result = await model.generateContent(prompt);
    const summary = (await result.response).text().trim();

    if (userId) {
      await DailyMCQSummary.findOneAndUpdate(
        { userId },
        { combinedSummary: summary, updatedAt: new Date() },
        { upsert: true }
      );
    }

    return summary || "A summary could not be generated today.";
  } catch (e) {
    console.error("Gemini summary error:", e);
    return "A summary could not be generated today.";
  }
};
