import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { workingHours } = await req.json();

        if (!Array.isArray(workingHours) || workingHours.length === 0) {
            return NextResponse.json({ success: false, error: "Invalid workingHours payload" }, { status: 400 });
        }

        // Validate each entry
        for (const entry of workingHours) {
            if (
                typeof entry.day !== "number" ||
                entry.day < 0 || entry.day > 6 ||
                typeof entry.isOpen !== "boolean" ||
                typeof entry.startTime !== "string" ||
                typeof entry.endTime !== "string"
            ) {
                return NextResponse.json({ success: false, error: "Invalid entry in workingHours" }, { status: 400 });
            }
        }

        await connectToDatabase();

        const business = await Business.findOne({ ownerEmail: session.user.email });
        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        business.workingHours = workingHours;
        await business.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[/api/calendar/working-hours] Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
