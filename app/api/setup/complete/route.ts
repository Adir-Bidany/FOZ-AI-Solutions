import { NextResponse } from "next/server";
import { createClient } from "@/services/client-service";
import { CollectedItem } from "@/components/setup/OnboardingSummary";

/** 
 * Helper to extract value from collected items by field name or question content (heuristic)
 * In a real app we would map questions to keys more robustly.
 */
function extractAnswer(data: CollectedItem[], keywords: string[]): string {
    const item = data.find(d =>
        keywords.some(k => d.question.includes(k) || d.fieldName.includes(k))
    );
    return item ? item.answer : "";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, collectedData, tempSlug } = body;

        // Verify we have credentials
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required." },
                { status: 400 }
            );
        }

        // Map collected answers to Business Model fields
        // Since we are mocking the "questions", we'll do a best-effort mapping or just store raw data
        // For this demo, let's assume we want to construct a basic profile

        // Note: In the real chat flow, we should probably have strictly defined 'keys' for each step
        // For now, we'll try to guess based on the data or just use defaults for missing required fields

        const businessName = extractAnswer(collectedData, ["עסק", "Business", "name"]) || "העסק שלי";
        const ownerName = extractAnswer(collectedData, ["שמך", "Name", "owner"]) || "בעלת העסק";
        const phone = extractAnswer(collectedData, ["טלפון", "Phone"]) || "";
        const niche = extractAnswer(collectedData, ["תחום", "Niche"]) || "aesthetics";

        // Use the existing createClient service
        const newClient = await createClient({
            businessName,
            ownerName,
            phone,
            email,
            password,
            tone: "יוקרתי ומקצועי", // Default or extract
            niche,
        });

        // Here we could also save the full 'collectedData' as 'onboarding_transcript' or similar
        // if the model supports it.

        return NextResponse.json({
            success: true,
            clientId: newClient._id,
            slug: newClient.slug,
        });
    } catch (error: any) {
        console.error("Setup Completion Error:", error.message);
        return NextResponse.json(
            { error: error.message || "Failed to create account" },
            { status: 400 }
        );
    }
}
