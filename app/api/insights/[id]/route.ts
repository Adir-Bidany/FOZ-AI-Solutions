import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AgentInsight from "@/models/AgentInsight";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectToDatabase();
        
        const { id: insightId } = await params;
        const { status } = await req.json();

        if (!insightId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Ownership check: only fetch if it belongs to the authenticated business
        const insight = await AgentInsight.findById(insightId);
        if (!insight) {
            return NextResponse.json({ error: "Insight not found" }, { status: 404 });
        }
        if (insight.businessId.toString() !== session.user.businessId) {
            return NextResponse.json({ error: "Forbidden: Insight does not belong to your business" }, { status: 403 });
        }

        insight.status = status;
        const updated = await insight.save();

        return NextResponse.json({ success: true, insight: updated });
    } catch (error) {
        console.error("Error archiving insight:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectToDatabase();

        const { id: insightId } = await params;
        if (!insightId) {
            return NextResponse.json({ error: "Missing insight ID" }, { status: 400 });
        }

        const insight = await AgentInsight.findById(insightId);
        if (!insight) {
            return NextResponse.json({ error: "Insight not found" }, { status: 404 });
        }
        if (insight.businessId.toString() !== session.user.businessId) {
            return NextResponse.json({ error: "Forbidden: Insight does not belong to your business" }, { status: 403 });
        }

        await AgentInsight.findByIdAndDelete(insightId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting insight:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
