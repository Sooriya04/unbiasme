const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const randomBiasPrompt = `
You are a psychology expert.

Select **one random cognitive bias** from any known psychological research or behavioral science sources (not limited to a fixed list).

Respond in **valid JSON only** using this structure:

{
  "name": "Name of the bias",
  "definition": "A simple 1-2 line explanation of the bias",
  "example": "A relatable real-world example",
  "prevention": "1-2 lines on how to avoid or reduce the bias"
}

Requirements:
- Pick a bias **randomly**, not always the same one
- Do not return the same bias repeatedly
- Avoid including markdown (no triple backticks, no explanation)
- Only return pure JSON as the output
`;

async function generateRandomBias() {
  const result = await model.generateContent(randomBiasPrompt);
  let text = result.response.text();

  if (text.startsWith("```")) {
    text = text.replace(/```json\s*([\s\S]*?)```/, "$1").trim();
    text = text.replace(/```\s*([\s\S]*?)```/, "$1").trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini returned invalid JSON:", text);
    throw err;
  }
}

module.exports = { generateRandomBias };
