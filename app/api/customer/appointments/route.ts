import { getAuthSecret } from "@/lib/auth-secret";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import Appointment from "@/models/Appointment";
import { Types } from "mongoose";


// ─── Helper: Verify consumer token and extract customerId ─────────────────────

async function getConsumerIdFromCookie(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("consumer_token")?.value;
        if (!token) return null;
        const decoded = jwt.verify(token, getAuthSecret()) as any;
        return decoded?.customerId ?? null;
    } catch {
        return null;
    }
}

// ─── GET /api/customer/appointments ──────────────────────────────────────────
// Query params:
//   type  = "upcoming" | "past"
//   limit = number (default 5)

export async function GET(req: Request) {
    const customerId = await getConsumerIdFromCookie();
    if (!customerId || !Types.ObjectId.isValid(customerId)) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type  = searchParams.get("type") as "upcoming" | "past" | null;
    const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 20);

    if (!type || !["upcoming", "past"].includes(type)) {
        return NextResponse.json(
            { success: false, error: "Invalid type parameter. Use 'upcoming' or 'past'." },
            { status: 400 }
        );
    }

    await connectToDatabase();

    const now = new Date();

    let query: any;
    let sortOrder: 1 | -1;

    if (type === "upcoming") {
        query = {
            user_id: new Types.ObjectId(customerId),
            "details.date": { $gte: now },
            status: { $in: ["confirmed", "pending"] },
            type: "booking",
        };
        sortOrder = 1; // Ascending — nearest first
    } else {
        query = {
            user_id: new Types.ObjectId(customerId),
            "details.date": { $lt: now },
            status: { $in: ["completed", "confirmed", "cancelled"] },
            type: "booking",
        };
        sortOrder = -1; // Descending — most recent first
    }

    const appointments = await Appointment.find(query)
        .sort({ "details.date": sortOrder })
        .limit(limit)
        .lean();

    const result = appointments.map((appt: any) => {
        const date = new Date(appt.details.date);
        const endDate = new Date(date.getTime() + (appt.details.duration_minutes ?? 60) * 60000);

        const pad = (n: number) => n.toString().padStart(2, "0");
        const startTime = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        const endTime   = `${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;

        return {
            id:               appt._id.toString(),
            service_name:     appt.details.service_name || "תור",
            date:             date.toISOString().split("T")[0],     // YYYY-MM-DD
            startTime,
            endTime,
            duration_minutes: appt.details.duration_minutes ?? 60,
            status:           appt.status,
            notes:            appt.metadata?.notes ?? null,
        };
    });

    return NextResponse.json({ success: true, appointments: result });
}
