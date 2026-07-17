import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function GET() {
    try {
        await connectToDatabase();
        const businesses = await Business.find({}, { businessName: 1, _id: 1 });
        return NextResponse.json({ success: true, businesses });
    } catch (error) {
        console.error("Error fetching businesses:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
