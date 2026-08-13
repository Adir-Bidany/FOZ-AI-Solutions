import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Customer from "@/models/Customer";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.businessId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const customers = await Customer.find({ business_id: session.user.businessId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, customers });
    } catch (error: any) {
        console.error("Failed to fetch customers:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
