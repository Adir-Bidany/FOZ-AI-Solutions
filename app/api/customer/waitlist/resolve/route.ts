import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import Waitlist from "@/models/Waitlist";
import Appointment from "@/models/Appointment";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_foz_ai";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("consumer_token")?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { waitlistId, action } = body;

        if (!waitlistId || !action || !["accept", "decline"].includes(action)) {
            return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
        }

        await connectToDatabase();

        const waitlist = await Waitlist.findOne({
            _id: waitlistId,
            user_id: decoded.customerId,
            business_id: decoded.businessId
        });

        if (!waitlist || waitlist.status !== "notified") {
            return NextResponse.json({ success: false, error: "Waitlist entry not found or not actionable" }, { status: 404 });
        }

        if (action === "decline") {
            waitlist.status = "declined";
            await waitlist.save();
            return NextResponse.json({ success: true, message: "Declined successfully" });
        }

        // --- ACCEPT ACTION ---
        const offeredDateStr = waitlist.offeredSlot?.date;
        const offeredTimeStr = waitlist.offeredSlot?.startTime;

        if (!offeredDateStr || !offeredTimeStr) {
            return NextResponse.json({ success: false, error: "Missing slot details" }, { status: 400 });
        }

        const startDateTime = new Date(`${offeredDateStr}T${offeredTimeStr}`);

        // RACE CONDITION CHECK
        const existingAppointment = await Appointment.findOne({
            business_id: decoded.businessId,
            "details.date": startDateTime,
            status: { $ne: "cancelled" }
        });

        if (existingAppointment) {
            // Taken by someone else
            waitlist.status = "waiting";
            waitlist.offeredSlot = undefined;
            await waitlist.save();
            return NextResponse.json({ 
                success: false, 
                error: "מצטערים, התור כבר נתפס על ידי לקוח אחר." 
            }, { status: 409 });
        }

        // Free! Create Appointment
        const newAppointment = await Appointment.create({
            business_id: decoded.businessId,
            user_id: decoded.customerId,
            type: "booking",
            title: waitlist.preferred_service || "תור מרשימת המתנה",
            details: {
                date: startDateTime,
                duration_minutes: 60, // Default fallback
                service_name: waitlist.preferred_service || "",
            },
            status: "confirmed",
            metadata: {
                source: "chat",
                notes: `נקבע דרך אישור רשימת המתנה. לקוח: ${waitlist.customer_name}`
            }
        });

        // Mark as fulfilled
        waitlist.status = "fulfilled";
        await waitlist.save();

        // RESET ALL OTHER LOSERS
        await Waitlist.updateMany(
            {
                business_id: decoded.businessId,
                status: "notified",
                "offeredSlot.date": offeredDateStr,
                "offeredSlot.startTime": offeredTimeStr,
                _id: { $ne: waitlistId }
            },
            {
                $set: { status: "waiting" },
                $unset: { offeredSlot: "" }
            }
        );

        return NextResponse.json({ success: true, appointmentId: newAppointment._id });

    } catch (error) {
        console.error("Waitlist Resolve API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
