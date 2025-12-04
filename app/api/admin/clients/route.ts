import { NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";

export async function GET() {
    try {
        await connectDB();

        // שליפת כל הלקוחות, ממוינים מהחדש לישן
        const clients = await Business.find({}).sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, clients });
    } catch (error) {
        console.error("Admin API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}
