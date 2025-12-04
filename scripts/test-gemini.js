const fs = require("fs");
const path = require("path");

function getEnvValue(key) {
    try {
        const envPath = path.resolve(__dirname, "../.env.local");
        const envContent = fs.readFileSync(envPath, "utf8");
        const match = envContent.match(new RegExp(`^${key}=(.*)$`, "m"));
        return match ? match[1].trim() : null;
    } catch (e) {
        console.error("Error reading .env.local:", e.message);
        return null;
    }
}

async function listModels() {
    const apiKey = getEnvValue("GEMINI_API_KEY");
    if (!apiKey) {
        console.error("No API key found in .env.local");
        return;
    }

    console.log("Fetching available models...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
