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

        const { date, isFullDay, startTime, endTime, reason } = await req.json();

        if (!date) {
            return NextResponse.json({ success: false, error: "Missing required field: date" }, { status: 400 });
        }

        await connectToDatabase();

        const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        // Build the block date object.
        // If full-day: the date alone is sufficient. The is_full_day flag marks the intent.
        // If partial: combine date + startTime to set a precise DateTime for the document.
        const blockDate = new Date(date);

        // If specific time is given, set the hours/minutes on the date object
        if (!isFullDay && startTime) {
            const [hours, minutes] = startTime.split(":").map(Number);
            blockDate.setHours(hours, minutes, 0, 0);
        }

        // Calculate duration_minutes for partial blocks
        let durationMinutes = 480; // default 8 hours (full day proxy)
        if (!isFullDay && startTime && endTime) {
            const [sH, sM] = startTime.split(":").map(Number);
            const [eH, eM] = endTime.split(":").map(Number);
            durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);
            if (durationMinutes <= 0) {
                return NextResponse.json({ success: false, error: "endTime must be after startTime" }, { status: 400 });
            }
        }

        const blockTitle = reason?.trim() || "חסימת יומן";

        const newBlock = new Appointment({
            business_id: new Types.ObjectId((business as any)._id.toString()),
            type: "block",
            title: blockTitle,
            status: "confirmed",
            details: {
                date: blockDate,
                duration_minutes: durationMinutes,
                service_name: blockTitle,
                is_full_day: !!isFullDay,
            },
            metadata: {
                source: "block",
                notes: reason?.trim() || undefined,
            },
        });

        await newBlock.save();

        return NextResponse.json({ success: true, blockId: newBlock._id.toString() });
    } catch (error) {
        console.error("[/api/calendar/block] Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        await connectToDatabase();

        const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        const query: Record<string, any> = {
            business_id: (business as any)._id,
            type: "block",
        };

        if (from || to) {
            query["details.date"] = {};
            if (from) query["details.date"]["$gte"] = new Date(from);
            if (to)   query["details.date"]["$lte"] = new Date(to);
        }

        const blocks = await Appointment.find(query).lean();

        return NextResponse.json({ success: true, blocks });
    } catch (error) {
        console.error("[/api/calendar/block GET] Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
