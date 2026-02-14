const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("Testing Gemini API...");
    console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : "Missing");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // List of models to try based on user screenshot/availability
    const models = [
        "gemini-2.0-flash-exp",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-2.0-pro-exp-02-05",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro-latest"
    ];

    console.log("Probing available models...");

    for (const modelName of models) {
        try {
            console.log(`\nTrying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello");
            console.log(`✅ Success with ${modelName}:`, result.response.text());
            console.log(`-> Using THIS model ID for backend update.`);
            // If found, print instructions to update backend
            console.log(`\nTo update backend, replace 'gemini-1.5-flash' with '${modelName}' in services/*.js`);
            return;
        } catch (error) {
            console.error(`❌ Failed with ${modelName}: ${error.message.split('\n')[0]}`);
            if (error.message.includes("404")) {
                console.log("-> Model not found.");
            } else if (error.message.includes("403")) {
                console.log("-> Access denied (API key restriction).");
            }
        }
    }
}

test();
