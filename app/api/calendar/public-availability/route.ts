import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";
import { addDays, startOfDay, endOfDay, format } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

// ─── GET /api/calendar/public-availability ────────────────────────────────────
// Public — no auth required.
// Query params:
//   businessId  = MongoDB ObjectId or slug string
//   weekStart   = ISO date string (the Sunday of the target week, e.g. "2026-09-21")
//
// Returns: { [YYYY-MM-DD]: { closedDay: boolean, takenHours: number[] } }
// ZERO private data — no customer names, notes, prices, or appointment IDs.

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get("businessId");
        const weekStartStr = searchParams.get("weekStart");

        if (!businessId || !weekStartStr) {
            return NextResponse.json(
                { success: false, error: "Missing businessId or weekStart parameter" },
                { status: 400 }
            );
        }

        // Parse the week — always 7 days from the provided Sunday
        const weekStart = startOfDay(new Date(weekStartStr));
        if (isNaN(weekStart.getTime())) {
            return NextResponse.json(
                { success: false, error: "Invalid weekStart date format" },
                { status: 400 }
            );
        }
        const weekEnd = endOfDay(addDays(weekStart, 6));

        await connectToDatabase();

        // Fetch business working hours — support lookup by ObjectId OR by slug
        let business: any = null;
        const { Types } = await import("mongoose");
        if (Types.ObjectId.isValid(businessId)) {
            business = await Business.findById(businessId).select("workingHours slug").lean();
        }
        if (!business) {
            business = await Business.findOne({ slug: businessId }).select("workingHours slug").lean();
        }

        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        const workingHours: any[] = business.workingHours ?? [];

        // Fetch all non-cancelled appointment + block docs for the week
        // Select only the minimal fields needed for the derived map
        const appointments = await Appointment.find({
            business_id: business._id,
            "details.date": { $gte: weekStart, $lte: weekEnd },
            status: { $nin: ["cancelled"] },
        })
            .select("details.date details.duration_minutes details.is_full_day type")
            .lean();

        // ─── Build the availability map ────────────────────────────────────────
        const availabilityMap: Record<string, { closedDay: boolean; takenHours: number[] }> = {};

        for (let i = 0; i < 7; i++) {
            const day = addDays(weekStart, i);
            const dayKey = format(day, "yyyy-MM-dd"); // "YYYY-MM-DD"
            const dowIndex = day.getDay(); // 0=Sun … 6=Sat

            // Determine if the day is closed per working hours config
            const dayConfig = workingHours.find((w: any) => w.day === dowIndex);
            const isClosed = dayConfig ? !dayConfig.isOpen : false;

            availabilityMap[dayKey] = { closedDay: isClosed, takenHours: [] };
        }

        // Overlay booked/blocked hours — strip all private info
        for (const appt of appointments as any[]) {
            const apptDate = new Date(appt.details.date);
            const dayKey = format(apptDate, "yyyy-MM-dd");

            if (!availabilityMap[dayKey]) continue;

            // Full-day blocks mark the entire day as closed
            if (appt.details.is_full_day) {
                availabilityMap[dayKey].closedDay = true;
                availabilityMap[dayKey].takenHours = [];
                continue;
            }

            // Mark each hour slot covered by this appointment
            const startHour = apptDate.getHours();
            const durationHours = Math.ceil((appt.details.duration_minutes ?? 60) / 60);
            for (let h = 0; h < durationHours; h++) {
                const slotHour = startHour + h;
                if (!availabilityMap[dayKey].takenHours.includes(slotHour)) {
                    availabilityMap[dayKey].takenHours.push(slotHour);
                }
            }
        }

        // Also mark hours outside working hours as taken (so the calendar grays them out)
        for (const [dayKey, dayData] of Object.entries(availabilityMap)) {
            if (dayData.closedDay) continue;

            const dayDate = new Date(dayKey);
            const dowIndex = dayDate.getDay();
            const dayConfig = workingHours.find((w: any) => w.day === dowIndex);
            if (!dayConfig || !dayConfig.isOpen) continue;

            const openStart = Math.floor(toMinutes(dayConfig.startTime) / 60);
            const openEnd   = Math.ceil(toMinutes(dayConfig.endTime) / 60);

            // Hours before open or after close — add to takenHours
            for (let h = 0; h < 24; h++) {
                if (h < openStart || h >= openEnd) {
                    if (!dayData.takenHours.includes(h)) {
                        dayData.takenHours.push(h);
                    }
                }
            }

            // Sort for clean output
            dayData.takenHours.sort((a, b) => a - b);
        }

        return NextResponse.json({ success: true, availability: availabilityMap });
    } catch (error: any) {
        console.error("[/api/calendar/public-availability] Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
