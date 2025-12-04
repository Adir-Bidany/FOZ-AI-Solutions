import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const apiKey = process.env.GEMINI_API_KEY;

async function listModelsRaw() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("✅ Available Models:");
            data.models.forEach((m: any) => console.log(`- ${m.name}`));
        } else {
            console.error("❌ No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
    }
}

listModelsRaw();
