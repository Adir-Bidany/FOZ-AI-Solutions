import { GoogleGenerativeAI, Content } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in environment variables");
const genAI = new GoogleGenerativeAI(apiKey);

export function mapChatHistory(messages: any[]): Content[] {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map((m: any) => ({
        role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
        parts: m.parts.map((p: any) => ({ text: p.text || "" }))
    }));
}

export function cleanAIResponse(rawText: string): string {
    if (!rawText) return "";
    
    let text = rawText;
    
    text = text.replace(/```json[\s\S]*?```/gi, "").trim();
    text = text.replace(/\{[\s\S]*"submit_for_approval"[\s\S]*\}/gi, "").trim();
    text = text.replace(/\{[\s\S]*"approve_asset"[\s\S]*\}/gi, "").trim();
    text = text.replace(/\{[\s\S]*"delegate_task"[\s\S]*\}/gi, "").trim();
    text = text.replace(/\{[\s\S]*"check_availability"[\s\S]*\}/gi, "").trim();
    text = text.replace(/\{[\s\S]*"book_appointment"[\s\S]*\}/gi, "").trim();
    
    return text.trim();
}

export function createGeminiInstance(options: { 
    modelName?: string, 
    systemInstruction?: string, 
    responseSchema?: any,
    tools?: any[]
}) {
    const config: any = {
        model: options.modelName || "gemini-2.5-flash",
    };

    if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
    }

    if (options.tools && options.tools.length > 0) {
        config.tools = options.tools;
    }

    if (options.responseSchema) {
        config.generationConfig = {
            responseSchema: options.responseSchema
        };
        // Google AI forbids combining tools with responseMimeType: 'application/json'
        if (!options.tools || options.tools.length === 0) {
            config.generationConfig.responseMimeType = "application/json";
        }
    }

    return genAI.getGenerativeModel(config);
}
