const { GoogleGenerativeAI } = require("@google/generative-ai");
const Bias = require("../models/bias");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateRandomBias() {
  const usedBiases = await Bias.find().select("name -_id");
  const usedNames = usedBiases.map((b) => b.name.toLowerCase());

  const prompt = `
You are a psychology expert.

Pick one random cognitive bias (not previously mentioned): 

Already used: [${usedNames.join(", ")}]

Respond only with JSON like:
{
  "name": "Name of the bias",
  "definition": "1-2 line explanation",
  "example": "Short real-world scenario",
  "prevention": "1-2 lines on avoiding this bias"
}

Do not include markdown or text, only raw JSON.
`;

  const result = await model.generateContent(prompt);
  let text = result.response.text().trim();

  // Clean up any accidental markdown
  if (text.startsWith("```")) {
    text = text.replace(/```json\s*([\s\S]*?)```/, "$1").trim();
  }

  try {
    const bias = JSON.parse(text);

    const isUsed = usedNames.includes(bias.name?.toLowerCase());
    if (isUsed) {
      console.log("Bias already used recently. Skipping.");
      return null;
    }

    // Save bias to DB
    const saved = await Bias.create(bias);
    return saved;
  } catch (err) {
    console.error("❌ Gemini returned invalid JSON:", text);
    return null;
  }
}

module.exports = { generateRandomBias };
