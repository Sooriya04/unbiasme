const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateDailyStory() {
  const prompt = `
You're a creative writer and psychology expert.

Write a short fictional story (~500 words) that illustrates a real-world example of a cognitive bias.

The story should:
- Have a short title.
- Include a clear example of a bias.
- End with a small lesson or insight.

Then, return a JSON with:
{
  "title": "Title of the story",
  "content": "Full story content",
  "biasName": "Name of the bias",
  "biasDefinition": "Short definition of the bias",
  "whatWentWrong": "Explain what the character did wrong due to the bias",
  "howMinimized": "How the bias was identified or reduced",
  "howHelps": "What readers can learn from it"
}
Only return raw JSON. Do not include markdown or explanation.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Clean up response in case it’s wrapped in ```json ... ```
    const cleaned = rawText
      .replace(/^```json/gm, "")
      .replace(/^```/gm, "")
      .trim();

    // Extract and parse only the JSON part
    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");
    const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

    const story = JSON.parse(jsonString);
    return story;
  } catch (err) {
    console.error("❌ Gemini story generation failed:", err);
    return null;
  }
}

module.exports = { generateDailyStory };
