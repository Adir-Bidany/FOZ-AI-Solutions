import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";
import { Types } from "mongoose";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { date, time, endTime, service_name, customer_name, customer_phone } = await req.json();

        if (!date || !time) {
            return NextResponse.json({ success: false, error: "Missing required fields: date or time" }, { status: 400 });
        }

        const startDateTime = new Date(`${date}T${time}`);
        if (startDateTime < new Date()) {
            return NextResponse.json({ success: false, error: "Cannot book in the past" }, { status: 400 });
        }

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

        const newAppt = new Appointment({
            business_id: new Types.ObjectId((business as any)._id.toString()),
            type: "booking",
            status: "confirmed",
            details: {
                date: startDateTime,
                duration_minutes: durationMinutes,
                service_name: service_name?.trim() || "",
            },
            metadata: {
                source: "manual",
                notes: [
                    customer_name ? `שם: ${customer_name.trim()}` : null,
                    customer_phone ? `טלפון: ${customer_phone.trim()}` : null,
                ].filter(Boolean).join(" | ") || undefined,
            },
        });

        await newAppt.save();

        return NextResponse.json({ success: true, appointmentId: newAppt._id.toString() });
    } catch (error) {
        console.error("[/api/calendar/appointments] Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
