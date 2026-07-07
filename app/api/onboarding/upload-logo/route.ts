import { NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";

export async function POST(req: Request) {
    try {
        const { slug, logoBase64 } = await req.json();

        if (!logoBase64)
            return NextResponse.json(
                { error: "No logo provided" },
                { status: 400 }
            );

        await connectDB();

        const business = await Business.findOne({ slug });
        if (!business)
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );

        business.logo = logoBase64;
        await business.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json(
            { error: "Failed to upload" },
            { status: 500 }
        );
    }
}
