import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Customer from "@/models/Customer";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.businessId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resolvedParams = await params;
        const { status } = await req.json();

        await connectToDatabase();
        
        const customer = await Customer.findOneAndUpdate(
            { _id: resolvedParams.id, businessId: session.user.businessId },
            { status },
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
            businessId: session.user.businessId 
        });

        if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
