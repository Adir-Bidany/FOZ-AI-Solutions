import { getAuthSecret } from "@/lib/auth-secret";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import Waitlist from "@/models/Waitlist";


export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("consumer_token")?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, getAuthSecret());
        } catch (err) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        await connectToDatabase();

        const entry = await Waitlist.findOne({
            user_id: decoded.customerId,
            business_id: decoded.businessId,
            status: "notified"
        });

        if (!entry) {
            return NextResponse.json({ success: true, entry: null });
        }

        return NextResponse.json({ success: true, entry });
    } catch (error) {
        console.error("Waitlist Notified API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
