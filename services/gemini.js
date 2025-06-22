const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function generateContent(traitScores) {
  return `
You are an expert psychologist.

Analyze the following Big Five personality trait scores:

${Object.entries(traitScores)
  .map(([key, value]) => `${key}: ${value}%`)
  .join("\n")}

Based on these, return a valid JSON object with:

{
  "summary": "An elaborate but easy-to-understand personality summary based on each of the five traits. Clearly explain if a trait score is high or low, and what that means about the person in real life. Use engaging and simple language. Keep it friendly and insightful.",
  "biases": [
    {
      "name": "Name of bias",
      "description": "Explain clearly what this bias means",
      "example": "Give a real-life relatable scenario",
      "prevention": "Give a practical prevention tip with a situation"
    }
  ],
  "workplace": {
    "environment": "Ideal environment description",
    "strengths": "Workplace strengths based on traits",
    "challenges": "Common workplace challenges"
  }
}
Make sure the response is only pure JSON. Do not include any extra commentary or markdown.`;
}

// Handle Gemini response safely
async function getGeminiAnalysis(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const textRaw = (await result.response).text().trim();

    // 1. Remove Markdown JSON block (```json ... ```)
    const cleaned = textRaw
      .replace(/^```json/i, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const data = JSON.parse(cleaned);

    if (
      data.summary &&
      Array.isArray(data.biases) &&
      data.biases.length > 0 &&
      data.workplace &&
      data.workplace.environment &&
      data.workplace.strengths &&
      data.workplace.challenges
    ) {
      return data;
    } else {
      console.error("Gemini returned incomplete data:", data);
      return null;
    }
  } catch (err) {
    console.error(" Gemini error:", err.message || err);
    return null;
  }
}

module.exports = { generateContent, getGeminiAnalysis };
