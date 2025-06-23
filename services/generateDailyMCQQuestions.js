const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `
You are a psychologist specializing in cognitive biases.

Generate exactly 3 self-reflection multiple-choice questions based on real-life scenarios that reflect specific cognitive biases. Each question should reflect **one** named bias (e.g., anchoring bias, confirmation bias, framing effect, etc.).

Each question should have 5 answer choices (A to E), ranging from very biased to very rational:
- A = very irrational or strongly biased response
- B = slightly biased
- C = neutral
- D = mostly rational
- E = very rational or unbiased

Each question must clearly demonstrate the bias in a realistic situation. Ensure the bias is easy to identify by the situation.

Format your response as valid JSON ONLY. No markdown.

[
  {
    "text": "<short real-life scenario involving a specific bias>",
    "bias": "<name of the bias>",
    "options": {
      "A": "<very biased or irrational response>",
      "B": "<slightly biased response>",
      "C": "<neutral response>",
      "D": "<fairly unbiased response>",
      "E": "<very rational or unbiased response>"
    }
  },
  ...
]
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
    console.error("Gemini question generation failed:", err);
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
