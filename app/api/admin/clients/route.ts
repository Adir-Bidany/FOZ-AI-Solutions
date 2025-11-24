import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function GET() {
    try {
        await connectDB();

        // שליפת כל הלקוחות, ממוינים מהחדש לישן
        const clients = await Client.find({}).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, clients });
    } catch (error) {
        console.error("Admin API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}
