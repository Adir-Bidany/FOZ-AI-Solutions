import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Customer from "@/models/Customer";

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.businessId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { customerId, newStatus } = body;

        if (!customerId || !newStatus) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const validStatuses = ["New", "Contacted", "Meeting Set", "Closed"];
        if (!validStatuses.includes(newStatus)) {
            return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        await connectToDatabase();

        const updatedCustomer = await Customer.findOneAndUpdate(
            { _id: customerId, business_id: session.user.businessId },
            { $set: { pipeline_status: newStatus } },
            { new: true }
        );

        if (!updatedCustomer) {
            return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedCustomer });
    } catch (error) {
        console.error("Error moving pipeline status:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
