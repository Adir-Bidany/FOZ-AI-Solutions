import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import KnowledgeBase from "@/models/KnowledgeBase";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.businessId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        let kb = await KnowledgeBase.findOne({ business_id: session.user.businessId });
        
        if (!kb) {
            // Create a default KB if none exists
            kb = await KnowledgeBase.create({
                business_id: session.user.businessId,
                services: [],
                faqs: [],
                files: []
            });
        }

        return NextResponse.json({ success: true, data: kb });
    } catch (error) {
        console.error("Error fetching knowledge base:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.businessId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        await connectToDatabase();

        let kb = await KnowledgeBase.findOne({ business_id: session.user.businessId });
        
        if (!kb) {
            kb = new KnowledgeBase({ business_id: session.user.businessId });
        }

        // Update fields if provided
        if (body.services !== undefined) kb.services = body.services;
        if (body.faqs !== undefined) kb.faqs = body.faqs;
        if (body.files !== undefined) kb.files = body.files;
        if (body.businessHours !== undefined) kb.businessHours = body.businessHours;

        await kb.save();

        return NextResponse.json({ success: true, data: kb });
    } catch (error) {
        console.error("Error updating knowledge base:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
