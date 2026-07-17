import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import AgentInsight from "@/models/AgentInsight";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        
        const { id: insightId } = await params;
        const { status } = await req.json();

        if (!insightId || !status) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updated = await AgentInsight.findByIdAndUpdate(
            insightId,
            { status },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: "Insight not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, insight: updated });
    } catch (error) {
        console.error("Error archiving insight:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
