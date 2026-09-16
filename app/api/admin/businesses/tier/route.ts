import { NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { getToken } from "next-auth/jwt";

export async function POST(request: Request) {
    // Admin RBAC verification
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    const cookiesHeader = request.headers.get("cookie") || "";
    const hasAdminCookie = cookiesHeader.includes("admin_access=true");
    
    if (!hasAdminCookie && (!token || token.role !== "admin")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const body = await request.json();
        const { businessId, tier } = body;

        if (!businessId || !tier) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const validTiers = ["basic", "pro", "enterprise"];
        if (!validTiers.includes(tier)) {
            return NextResponse.json({ success: false, error: "Invalid tier" }, { status: 400 });
        }

        // CRITICAL LOGIC: Update tier AND nullify trial_ends_at to make them a permanent customer
        const updatedClient = await Business.findByIdAndUpdate(
            businessId,
            { 
                $set: { 
                    subscription_tier: tier,
                    trial_ends_at: null 
                } 
            },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedClient) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Tier updated and trial overridden successfully",
            client: updatedClient,
        });
    } catch (error: any) {
        console.error("Update tier error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update tier" },
            { status: 500 }
        );
    }
}