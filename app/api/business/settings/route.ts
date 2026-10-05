import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

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

        // Map api_keys natively as object
        const apiKeys = business.api_keys || {};

        return NextResponse.json({
            success: true,
            data: {
                businessName: business.businessName,
                ownerName: business.ownerName,
                phone: business.phone || "",
                address: business.address || "",
                // description is not in the schema explicitly but might be needed? 
                // Checking schema: no description field. 
                // Maybe it was 'about_text' in landing_page_data? 
                // The settings page has a "description" field. 
                // Let's check if we can map it to something or if we need to add it.
                // For now, let's map it to landing_page_data.about_text if available, or just ignore if not in schema.
                // Actually, let's check the schema again.
                // Schema has: landing_page_data.about_text.
                description: business.landing_page_data?.about_text || "",
                publicInstructions: business.publicInstructions || "",
                internalNotes: business.internalNotes || "",

                // Integrations
                apiKeys: {
                    companyLogin: apiKeys.simplybook?.companyLogin || "",
                    apiKey: apiKeys.simplybook?.apiKey || ""
                },
                
                hasServices: !!business.hasServices,
                policies: business.policies || [],
                tone: business.ai_settings?.tone || "Professional"
            }
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

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

        // Update fields
        if (body.businessName !== undefined) business.businessName = body.businessName;
        if (body.ownerName !== undefined) business.ownerName = body.ownerName;
        if (body.phone !== undefined) business.phone = body.phone;
        if (body.address !== undefined) business.address = body.address;
        if (body.publicInstructions !== undefined) business.publicInstructions = body.publicInstructions;
        if (body.internalNotes !== undefined) business.internalNotes = body.internalNotes;

        // Update description -> landing_page_data.about_text
        if (body.description !== undefined) {
            if (!business.landing_page_data) business.landing_page_data = {};
            business.landing_page_data.about_text = body.description;
        }

        if (body.hasServices !== undefined) {
            business.hasServices = body.hasServices;
        }

        if (body.policies !== undefined) {
            business.policies = body.policies;
        }

        if (body.tone !== undefined) {
            if (!business.ai_settings) business.ai_settings = {};
            business.ai_settings.tone = body.tone;
        }

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

export async function PATCH(req: Request) {
    return POST(req);
}
