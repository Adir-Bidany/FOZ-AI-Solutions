"use server";

import { connectToDatabase } from "@/lib/db";
import ActionCard from "@/models/ActionCard";
import { sendWhatsApp, updatePriceList, checkAvailability } from "@/lib/tools";
import { revalidatePath } from "next/cache";

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

import Business from "@/models/Business";

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
