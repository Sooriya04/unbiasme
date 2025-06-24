const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = `
You are a cognitive psychologist and storyteller.

1. Pick a **random cognitive bias** (don't repeat every day).
2. Write a **short fictional story** (200–300 words) involving a character who shows that bias in a real-life situation.
3. Then, explain:
   - The name of the bias
   - Its definition
   - What went wrong in the story
   - How the bias was minimized or solved
   - How this helps in future decisions

Respond only in valid JSON:

{
  "title": "Story title",
  "content": "Full story body (short fiction)",
  "biasName": "Bias name",
  "biasDefinition": "Definition",
  "whatWentWrong": "Issue shown in the story",
  "howMinimized": "How the bias was reduced",
  "howHelps": "How this lesson helps the reader"
}
`;

async function generateDailyStory() {
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Optional check: Ensure all required keys exist
    const requiredKeys = [
      "title",
      "content",
      "biasName",
      "biasDefinition",
      "whatWentWrong",
      "howMinimized",
      "howHelps",
    ];
    for (const key of requiredKeys) {
      if (!parsed[key]) throw new Error(`Missing key: ${key}`);
    }

    return parsed;
  } catch (err) {
    console.error("Gemini JSON error:\n", text);
    throw err;
  }
}

module.exports = { generateDailyStory };
