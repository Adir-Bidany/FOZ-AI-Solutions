import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function POST(req: Request) {
    try {
        const { slug, managerGender, managerName } = await req.json();

        if (!slug || !managerGender || !managerName) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // Update AI settings with manager persona
        const business = await Business.findOneAndUpdate(
            { slug },
            {
                $set: {
                    "ai_settings.manager_name": managerName,
                    "ai_settings.manager_gender": managerGender
                }
            },
            { new: true }
        );

        if (!business) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, client: business });
    } catch (error) {
        console.error("Error updating manager settings:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
