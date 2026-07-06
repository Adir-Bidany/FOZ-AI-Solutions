"use server";

import { connectToDatabase } from "@/lib/db";
import ActionCard from "@/models/ActionCard";
import { sendWhatsApp, updatePriceList, checkAvailability } from "@/lib/tools";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Business from "@/models/Business";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { GOLDA_PRESET } from "@/lib/constants/personas";

export async function fetchActionCards(businessId: string) {
    await connectToDatabase();
    try {
        const cards = await ActionCard.find({
            business_id: businessId,
            status: "pending"
        }).sort({ created_at: -1 });

        // Serialize MongoDB objects to plain JSON
        return JSON.parse(JSON.stringify(cards));
    } catch (error) {
        console.error("Failed to fetch action cards:", error);
        return [];
    }
}

export async function approveActionCard(cardId: string) {
    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");

        // Execute the suggested action
        const { action_type, params } = card.execution_payload;
        let result;

        switch (action_type) {
            case "send_message":
                result = await sendWhatsApp(params.phone, params.message);
                break;
            case "update_db":
                // Assuming params has serviceName and newPrice for this example
                if (params.serviceName && params.newPrice) {
                    result = await updatePriceList(params.serviceName, params.newPrice);
                }
                break;
            case "cancel_appointment":
                // Implement cancellation logic here
                console.log("Cancelling appointment...", params);
                // result = await cancelAppointment(params.chat_id, params.original_message);
                break;
            // Add other cases as needed
            default:
                console.log(`Action type ${action_type} not implemented yet.`);
        }

        // Update card status
        card.status = "approved";
        await card.save();

        revalidatePath("/dashboard");
        return { success: true, result };
    } catch (error) {
        console.error("Failed to approve card:", error);
        return { success: false, error: "Failed to approve action" };
    }
}

import ChatInternal from "@/models/ChatInternal";

export async function fetchInternalChat(businessId: string, agentPersona: string) {
    await connectToDatabase();
    try {
        const chat = await ChatInternal.findOne({
            business_id: businessId,
            agent_persona: agentPersona
        }).lean();

        if (!chat) return [];

        return JSON.parse(JSON.stringify(chat.messages));
    } catch (error) {
        console.error("Failed to fetch internal chat:", error);
        return [];
    }
}

export async function sendInternalMessage(businessId: string, agentPersona: string, message: string) {
    await connectToDatabase();
    try {
        const business = await Business.findById(businessId).lean();

        let chat = await ChatInternal.findOne({
            business_id: businessId,
            agent_persona: agentPersona
        });

        if (!chat) {
            chat = await ChatInternal.create({
                business_id: businessId,
                agent_persona: agentPersona,
                messages: []
            });
        }

        // Add user message to DB first
        chat.messages.push({
            role: "user",
            parts: [{ text: message }],
            timestamp: new Date()
        });

        // Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is not defined in environment variables");
        
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Construct System Instruction based on Business Context & Persona
        let systemInstruction = `You are an internal AI assistant for a business named "${business?.businessName || 'the business'}".
The owner's name is ${business?.ownerName || 'the owner'}.\n`;

        // Apply strict role boundaries
        if (agentPersona === "golda" && AGENT_PROMPTS.golda) {
            systemInstruction += AGENT_PROMPTS.golda(business);
        } else if (agentPersona === "michal" && AGENT_PROMPTS.michal) {
            systemInstruction += AGENT_PROMPTS.michal(business);
        } else if (agentPersona === "roi" && AGENT_PROMPTS.roi) {
            systemInstruction += AGENT_PROMPTS.roi(business);
        }

        // Apply hardcore persona overrides for Golda
        if (agentPersona === "golda" && GOLDA_PRESET.system_prompt_override) {
            systemInstruction += "\n\n" + GOLDA_PRESET.system_prompt_override;
        }

        // Force Hebrew for everyone as requested by user
        systemInstruction += "\n\nCRITICAL RULE: You MUST ALWAYS reply in Hebrew. Never speak English unless explicitly asked to translate. Keep your responses concise and natural.";

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction 
        });

        // Map existing chat history for Gemini (exclude the latest user message we just pushed, as we send it via sendMessage)
        const history = chat.messages.slice(0, -1).map((m: any) => ({
            role: m.role === "model" ? "model" : "user",
            parts: m.parts.map((p: any) => ({ text: p.text }))
        }));

        const chatSession = model.startChat({
            history: history
        });

        // Send the new message to Gemini
        const result = await chatSession.sendMessage(message);
        const aiResponseText = result.response.text();

        // Add AI response to DB
        chat.messages.push({
            role: "model",
            parts: [{ text: aiResponseText }],
            timestamp: new Date()
        });

        await chat.save();
        return JSON.parse(JSON.stringify(chat.messages));
    } catch (error) {
        console.error("Failed to send internal message via Gemini:", error);
        throw error;
    }
}

export async function dismissActionCard(cardId: string) {
    await connectToDatabase();
    try {
        await ActionCard.findByIdAndUpdate(cardId, { status: "dismissed" });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to dismiss card:", error);
        return { success: false, error: "Failed to dismiss action" };
    }
}



export async function updateLandingPage(businessId: string, data: any) {
    await connectToDatabase();
    try {
        await Business.findByIdAndUpdate(businessId, {
            $set: { landing_page_data: data }
        });
        revalidatePath("/dashboard/website");
        revalidatePath(`/c/${data.slug}`); // Revalidate public page if slug is known, or just general revalidation
        return { success: true };
    } catch (error) {
        console.error("Failed to update landing page:", error);
        return { success: false, error: "Failed to update landing page" };
    }
}
