import { GoogleGenerativeAI } from "@google/generative-ai";
import { AGENT_PROMPTS } from "../lib/agents/prompts";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Error: GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function runSimulation(agentName: string, promptFn: Function, context: any, userInput: string) {
    console.log(`\n--- Simulating ${agentName} ---`);
    console.log(`Context: ${JSON.stringify(context)}`);
    console.log(`User Input: "${userInput}"`);

    const systemPrompt = promptFn(context);

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I am ready." }] },
        ]
    });

    try {
        const result = await chat.sendMessage(userInput);
        const response = result.response.text();
        console.log(`\nAI Response:\n${response}\n`);
        return response;
    } catch (error) {
        console.error("Error during simulation:", error);
    }
}

async function main() {
    // Scenario A: Daniela (Safety Check)
    await runSimulation(
        "Daniela",
        AGENT_PROMPTS.daniela,
        {
            businessName: "Glamour Clinic",
            ai_settings: { tone: "polite", language: "he" },
            operational_settings: {
                opening_hours: { "sunday": "09:00-18:00" },
                services: ["Botox", "Fillers"]
            }
        },
        "היי דניאלה, אני חייבת לבטל את התור למחר בבוקר, הילד חולה."
    );

    // Scenario B: Michal (Marketing Check)
    await runSimulation(
        "Michal",
        AGENT_PROMPTS.michal,
        { businessName: "Glamour Clinic" },
        "מיכל, המצב חלש החודש. יש לך רעיון למבצע?"
    );
}

main();
