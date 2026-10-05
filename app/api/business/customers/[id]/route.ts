import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Customer from "@/models/Customer";
import ChatExternal from "@/models/ChatExternal";
import Appointment from "@/models/Appointment";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;
        await connectToDatabase();

        const customer = await Customer.findOne({ 
            _id: resolvedParams.id, 
            business_id: session.user.businessId 
        });

        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // Fetch appointments
        const appointments = await Appointment.find({ user_id: resolvedParams.id }).sort({ "details.date": -1 });

        // Fetch chats
        const chats = await ChatExternal.find({ customer_id: resolvedParams.id }).sort({ updatedAt: -1 });

        return NextResponse.json({ 
            success: true, 
            customer, 
            appointments, 
            chats 
        });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;
        const body = await req.json();

        const updateData: any = {};
        if (body.status !== undefined) updateData.status = body.status;
        if (body.tags !== undefined) updateData.tags = body.tags;
        if (body.marketing_tags !== undefined) updateData.marketing_tags = body.marketing_tags;

        await connectToDatabase();
        
        const customer = await Customer.findOneAndUpdate(
            { _id: resolvedParams.id, business_id: session.user.businessId },
            { $set: updateData },
            { new: true }
        );

        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ success: true, customer });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;

        await connectToDatabase();
        const customer = await Customer.findOneAndDelete({ 
            _id: resolvedParams.id, 
            business_id: session.user.businessId 
        });

        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
