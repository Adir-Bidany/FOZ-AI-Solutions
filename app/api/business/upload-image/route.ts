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

        const { image, targetField } = await req.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: "No image provided" },
                { status: 400 }
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

        // Map targetField to actual schema path
        // Currently only supporting 'hero_image' mapping to 'landing_page_data.hero_image_url'
        let schemaPath = "";
        if (targetField === "hero_image") {
            schemaPath = "landing_page_data.hero_image_url";

            // Ensure landing_page_data exists
            if (!business.landing_page_data) {
                business.landing_page_data = {};
            }
            business.landing_page_data.hero_image_url = image;
        } else if (targetField === "logo") {
            business.logo = image;
        } else {
            return NextResponse.json(
                { success: false, error: "Invalid target field" },
                { status: 400 }
            );
        }

        await business.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
