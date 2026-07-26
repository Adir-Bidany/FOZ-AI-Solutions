import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ChatExternal from "@/models/ChatExternal";
import Business from "@/models/Business";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
        if (!business) {
            return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get("date");

        // Determine Start and End times based on Business Day (01:00 AM offset)
        // If dateParam is provided, use it. Otherwise use "now".
        const targetDate = dateParam ? new Date(dateParam) : new Date();

        // Business day starts at 01:00 AM of the target date
        // If it's currently before 01:00 AM, we are technically in the "previous" business day's late night.
        // But for simplicity, let's assume the user picks a date or we use "today".

        // Logic:
        // Start: Target Date at 01:00:00
        // End: Target Date + 1 Day at 01:00:00

        const startTime = new Date(targetDate);
        startTime.setHours(1, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setDate(endTime.getDate() + 1);

        // 1. Daily Count (External Chats)
        const dailyCount = await ChatExternal.countDocuments({
            business_id: business._id,
            createdAt: { $gte: startTime, $lt: endTime },
        });

        // 2. Lifetime Count
        const lifetimeCount = await ChatExternal.countDocuments({
            business_id: business._id,
        });

        // 3. Daily Breakdown (for export - optional, can be a separate endpoint if heavy)
        // For now, let's just return the counts. The export can fetch a dedicated endpoint or we can aggregate here if needed.
        // Let's keep it lightweight for polling.

        return NextResponse.json({
            dailyCount,
            lifetimeCount,
            businessDay: {
                start: startTime.toISOString(),
                end: endTime.toISOString(),
            }
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
