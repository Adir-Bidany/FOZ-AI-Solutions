import { GoogleGenerativeAI, Content } from "@google/generative-ai";

// Runtime guard: evaluated lazily so Next.js static build phases don't crash
function getGenAI(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in environment variables");
    return new GoogleGenerativeAI(apiKey);
}

export function mapChatHistory(messages: any[]): Content[] {
    if (!messages || !Array.isArray(messages)) return [];
    
    return messages.map((m: any) => ({
        role: (m.role === 'assistant' || m.role === 'model') ? 'model' : 'user',
        parts: m.parts.map((p: any) => ({ text: p.text || "" }))
    }));
}

/**
 * Attempts to extract a JSON object from a raw Gemini response.
 * Handles: plain JSON, markdown-wrapped JSON (```json ... ```), and JSON embedded in prose.
 * Returns the parsed object on success, or null on failure.
 */
export function extractJsonFromText(rawText: string): Record<string, any> | null {
    if (!rawText) return null;

    // 1. Try direct parse first (model obeyed responseSchema perfectly)
    try {
        return JSON.parse(rawText.trim());
    } catch (_) { /* not plain JSON */ }

    // 2. Try stripping markdown code fences (```json ... ```)
    const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
        try {
            return JSON.parse(fenceMatch[1].trim());
        } catch (_) { /* fence content not valid JSON */ }
    }

    // 3. Try extracting the first {...} block from mixed prose
    const objectMatch = rawText.match(/\{[\s\S]*\}/);
    if (objectMatch) {
        try {
            return JSON.parse(objectMatch[0]);
        } catch (_) { /* embedded JSON malformed */ }
    }

    return null;
}

/**
 * Sanitizes a plain-text AI response for display.
 * ONLY call this on non-JSON conversational responses.
 * Strips residual tool-call JSON blobs that occasionally leak into text output.
 */
export function cleanAIResponse(rawText: string): string {
    if (!rawText) return "";
    
    let text = rawText;
    
    // Strip markdown-wrapped tool call blobs
    text = text.replace(/```json[\s\S]*?```/gi, "").trim();
    // Strip bare JSON objects that look like tool calls (contain specific tool-call keys)
    text = text.replace(/\{[^{}]*"(?:submit_for_approval|approve_asset|delegate_task|check_availability|book_appointment)"[^{}]*\}/gi, "").trim();
    
    return text.trim();
}

export function createGeminiInstance(options: { 
    modelName?: string, 
    systemInstruction?: string, 
    responseSchema?: any,
    tools?: any[]
}) {
    const genAI = getGenAI();
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

