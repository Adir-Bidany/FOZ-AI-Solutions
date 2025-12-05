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
        }).select("landing_page_data");

        if (!business) {
            return NextResponse.json(
                { success: false, error: "Business not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: business.landing_page_data || {}
        });
    } catch (error) {
        console.error("Error fetching website settings:", error);
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

        const business = await Business.findOneAndUpdate(
            { ownerEmail: session.user.email },
            {
                $set: {
                    "landing_page_data.hero_title": body.hero_title,
                    "landing_page_data.hero_subtitle": body.hero_subtitle,
                    "landing_page_data.hero_image_url": body.hero_image_url,
                    // "landing_page_data.about_text": body.about_text, // REMOVED: Managed by Settings page, do not overwrite
                    "landing_page_data.features": body.features,
                    "landing_page_data.primary_color": body.primary_color,
                    "landing_page_data.background_style": body.background_style,
                    "landing_page_data.custom_background_image": body.custom_background_image
                }
            },
            { new: true }
        );

        if (!business) {
            return NextResponse.json(
                { success: false, error: "Business not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: business.landing_page_data });
    } catch (error) {
        console.error("Error updating website settings:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
