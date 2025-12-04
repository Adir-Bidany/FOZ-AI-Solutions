import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { companyLogin, apiKey } = await req.json();

        await connectToDatabase();

        const business = await Business.findOne({
            ownerEmail: session.user.email,
        });

        if (!business) {
            return NextResponse.json(
                { success: false, error: "Business not found" },
                { status: 404 }
            );
        }

        // Update SimplyBook keys
        if (!business.api_keys) {
            business.api_keys = {};
        }

        business.api_keys.simplybook = companyLogin;
        // Note: In a real app, we might want to encrypt the API key or store it more securely
        // For now, we are storing it as is, based on the schema
        // The schema has api_keys: { simplybook: { type: String } } which seems to be a single string?
        // Let's check the schema again.
        // Schema says: api_keys: { simplybook: { type: String }, whatsapp: { type: String } }
        // But the legacy code was sending companyLogin and apiKey.
        // Wait, the legacy code body was: body: JSON.stringify({ ...keys, slug: resolvedParams.slug }),
        // keys was { companyLogin: "", apiKey: "" }
        // The schema in Business.ts shows:
        // api_keys: {
        //     simplybook: { type: String },
        //     whatsapp: { type: String },
        // },
        // This looks like it only stores one string for simplybook. 
        // Let's re-read the legacy code to see how it was handling it.
        // Legacy code:
        // const res = await fetch("/api/settings/integrations", ...
        // It was sending companyLogin and apiKey.
        // But I don't see the legacy API route code. I only saw the legacy page code.
        // The user said: "Update the integrations.simplybook object with the provided companyLogin and apiKey."
        // This implies `integrations.simplybook` might be an object in the DB, or I should store them together?
        // Let's check the Business model again.
        // api_keys?: { simplybook?: string; whatsapp?: string; };
        // It seems simplybook is a string.
        // Maybe it expects a JSON string? Or maybe the schema is wrong/outdated?
        // Or maybe I should update the schema to support both?
        // The user instruction says: "Update the integrations.simplybook object with the provided companyLogin and apiKey."
        // "integrations.simplybook object" -> this suggests the structure in DB might be different or I should make it an object.
        // However, the current schema defines it as a String.
        // I will assume for now that I should store it as a JSON string or maybe I should check if I can update the schema.
        // But the user said "Update the integrations.simplybook object".
        // Let's look at the Business.ts file again.
        // Line 12: api_keys?: { simplybook?: string; whatsapp?: string; };
        // Line 46: api_keys: { simplybook: { type: String }, whatsapp: { type: String } },
        // It is definitely a string.
        // I will store it as a JSON string containing both fields to be safe and follow the "object" instruction in a way that fits the schema.
        // business.api_keys.simplybook = JSON.stringify({ companyLogin, apiKey });

        // actually, let's look at the legacy page again.
        // It sends `companyLogin` and `apiKey`.
        // If the backend expects to store them, and the schema is a string, JSON stringify is the most logical way to store structured data in a string field without changing schema.

        business.api_keys.simplybook = JSON.stringify({ companyLogin, apiKey });

        await business.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
