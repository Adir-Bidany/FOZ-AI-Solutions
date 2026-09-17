import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;

        await connectToDatabase();

        const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        const deletedAppt = await Appointment.findOneAndDelete({
            _id: id,
            business_id: (business as any)._id
        });

        if (!deletedAppt) {
            return NextResponse.json({ success: false, error: "Appointment not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[/api/calendar/appointments/[id]] DELETE Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;
        const { date, time, endTime, service_name, customer_name, customer_phone } = await req.json();

        if (!date || !time) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const startDateTime = new Date(`${date}T${time}`);
        
        let durationMinutes = 60;
        if (endTime) {
            const endDateTime = new Date(`${date}T${endTime}`);
            const diff = Math.max(0, (endDateTime.getTime() - startDateTime.getTime()) / 60000);
            if (diff > 0) durationMinutes = diff;
        }

        await connectToDatabase();

        const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        const updatedAppt = await Appointment.findOneAndUpdate(
            { _id: id, business_id: (business as any)._id },
            {
                $set: {
                    "details.date": startDateTime,
                    "details.duration_minutes": durationMinutes,
                    "details.service_name": service_name?.trim() || "",
                    "metadata.notes": [
                        customer_name ? `שם: ${customer_name.trim()}` : null,
                        customer_phone ? `טלפון: ${customer_phone.trim()}` : null,
                    ].filter(Boolean).join(" | ") || undefined,
                }
            },
            { new: true }
        );

        if (!updatedAppt) {
            return NextResponse.json({ success: false, error: "Appointment not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[/api/calendar/appointments/[id]] PATCH Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
