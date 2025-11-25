import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function POST(req: Request) {
    try {
        const { slug, logoBase64 } = await req.json();

        if (!logoBase64)
            return NextResponse.json(
                { error: "No logo provided" },
                { status: 400 }
            );

        await connectDB();

        const client = await Client.findOne({ slug });
        if (!client)
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );

        client.logo = logoBase64;
        await client.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json(
            { error: "Failed to upload" },
            { status: 500 }
        );
    }
}
