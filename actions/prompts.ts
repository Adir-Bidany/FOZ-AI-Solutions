"use server";

import { connectToDatabase } from "@/lib/db";
import AgentPromptBlock from "@/models/AgentPromptBlock";
import { seedInitialPromptBlocks } from "@/lib/agents/seed";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

/**
 * Triggers manual seeding of default prompt blocks if empty.
 */
export async function triggerSeedPrompts() {
    return await seedInitialPromptBlocks();
}

/**
 * Fetches all prompt blocks grouped by target_scope and sorted by sort_order.
 */
export async function fetchAllPromptBlocks() {
    await connectToDatabase();
    
    // Auto-seed if empty on first fetch
    await seedInitialPromptBlocks();

    const blocks = await AgentPromptBlock.find({}).sort({ target_scope: 1, sort_order: 1 }).lean();
    return JSON.parse(JSON.stringify(blocks));
}

/**
 * Updates an existing prompt block's content, active status, title, or sort order.
 */
export async function updatePromptBlock(
    blockId: string,
    data: {
        content?: string;
        is_active?: boolean;
        topic_title?: string;
        sort_order?: number;
        description?: string;
    }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const updated = await AgentPromptBlock.findByIdAndUpdate(
            blockId,
            { $set: data },
            { new: true }
        ).lean();

        revalidatePath("/admin");
        revalidatePath("/dashboard");
        return { success: true, block: JSON.parse(JSON.stringify(updated)) };
    } catch (error: any) {
        console.error("Failed to update prompt block:", error);
        return { success: false, error: error.message || "Failed to update prompt block" };
    }
}

/**
 * Creates a new custom prompt block.
 */
export async function createPromptBlock(data: {
    key_identifier: string;
    target_scope: "GLOBAL" | "PAZ" | "FOZ" | "DANIELA" | "GOLDA";
    topic_title: string;
    content: string;
    sort_order?: number;
    description?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const existing = await AgentPromptBlock.findOne({ key_identifier: data.key_identifier });
        if (existing) {
            throw new Error("מזהה הבלוק כבר קיים במערכת");
        }

        const created = await AgentPromptBlock.create({
            key_identifier: data.key_identifier,
            target_scope: data.target_scope,
            topic_title: data.topic_title,
            content: data.content,
            sort_order: data.sort_order ?? 20,
            description: data.description || "",
            is_active: true,
        });

        revalidatePath("/admin");
        revalidatePath("/dashboard");
        return { success: true, block: JSON.parse(JSON.stringify(created)) };
    } catch (error: any) {
        console.error("Failed to create prompt block:", error);
        return { success: false, error: error.message || "Failed to create prompt block" };
    }
}

/**
 * Deletes a prompt block by ID.
 */
export async function deletePromptBlock(blockId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        await AgentPromptBlock.findByIdAndDelete(blockId);
        revalidatePath("/admin");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete prompt block:", error);
        return { success: false, error: error.message || "Failed to delete prompt block" };
    }
}
