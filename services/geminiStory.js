const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function buildStoryPrompt(summary = "") {
  const characters = [
    "a teacher",
    "a startup founder",
    "a student",
    "a doctor",
    "a parent",
    "a team leader",
    "a designer",
    "a manager",
    "a social worker",
  ];
  const character = characters[Math.floor(Math.random() * characters.length)];

  return `
You are a helpful psychologist and storyteller.

Write a short, easy-to-understand story (about 250 words) about ${character} who encounters a common cognitive bias. Choose any known bias yourself (like confirmation bias, anchoring bias, sunk cost fallacy, etc.).

The story should include:
- A real-life situation where the bias affected the character’s decision
- What mistake was made due to the bias
- How they realized the mistake
- How they corrected or avoided it

Also include a clear definition of the bias.

Return only a JSON object like this:
{
  "title": "Catchy title",
  "content": "Full story (250 words max)",
  "biasName": "Name of the chosen bias",
  "biasDefinition": "One-sentence explanation of that bias",
  "whatWentWrong": "What mistake happened due to the bias",
  "howMinimized": "How the mistake was realized and fixed",
  "howHelps": "How this helps the reader avoid such mistakes"
}

Do not use markdown or extra text — only return valid JSON.
The story should be fresh, realistic, and easy for anyone to relate to.
`;
}

async function generateDailyStory(geminiAnalysis = {}) {
  const prompt = buildStoryPrompt(geminiAnalysis.summary || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

module.exports = { generateDailyStory };
