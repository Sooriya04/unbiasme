const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `
You are a psychologist specializing in cognitive biases.

Generate 3 short self-reflection multiple-choice questions based on real-life cognitive bias scenarios. Each question must reflect a specific bias (e.g., confirmation bias, anchoring bias, framing effect, etc.).

Return ONLY valid JSON:

[
  {
    "text": "<bias-related scenario question>",
    "options": {
      "A": "<very irrational or biased response>",
      "B": "<slightly biased>",
      "C": "<neutral response>",
      "D": "<fairly unbiased>",
      "E": "<very rational or unbiased>"
    }
  },
  ...
]

DO NOT add markdown or text outside the JSON array.
`;

module.exports = async () => {
  try {
    const result = await model.generateContent(SYSTEM_PROMPT);
    let raw = (await result.response).text().trim();
    raw = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(raw);

    if (!Array.isArray(questions) || questions.length !== 3)
      throw new Error("Invalid Gemini response");
    return questions;
  } catch (err) {
    console.error("⚠️ Gemini question generation failed:", err);
    return [
      {
        text: "You see a news article that supports your belief. What do you do?",
        options: {
          A: "Share it without reading",
          B: "Skim the title only",
          C: "Read it briefly",
          D: "Read it and compare with another source",
          E: "Critically evaluate multiple sources",
        },
      },
      {
        text: "You’re offered a deal '70% off'. How do you respond?",
        options: {
          A: "Buy immediately without thinking",
          B: "Assume it's a great deal",
          C: "Check price history once",
          D: "Compare across platforms",
          E: "Research actual value before deciding",
        },
      },
      {
        text: "A friend gives you advice with strong emotions. You...",
        options: {
          A: "Accept it completely",
          B: "Consider it without question",
          C: "Listen but reflect",
          D: "Ask others too",
          E: "Evaluate it logically",
        },
      },
    ];
  }
};
