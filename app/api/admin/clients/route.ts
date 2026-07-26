import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
    // Admin RBAC: Only authenticated admins may access this endpoint
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

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
