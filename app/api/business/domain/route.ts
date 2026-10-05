import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

// Regex for valid subdomains (lowercase alphanumeric and hyphens only)
const SUBDOMAIN_REGEX = /^[a-z0-9-]+$/;
const RESERVED_SUBDOMAINS = ["www", "app", "api", "admin", "mail", "dev", "test"];

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.businessId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        let { subdomain } = body;

        if (!subdomain) {
            return NextResponse.json({ success: false, error: "Subdomain is required" }, { status: 400 });
        }

        subdomain = subdomain.trim().toLowerCase();

        // Validate format
        if (!SUBDOMAIN_REGEX.test(subdomain)) {
            return NextResponse.json({ success: false, error: "Invalid format. Use only letters, numbers, and hyphens." }, { status: 400 });
        }

        if (subdomain.length < 3 || subdomain.length > 63) {
            return NextResponse.json({ success: false, error: "Must be between 3 and 63 characters." }, { status: 400 });
        }

        // Check reserved
        if (RESERVED_SUBDOMAINS.includes(subdomain)) {
            return NextResponse.json({ success: false, error: "This subdomain is reserved." }, { status: 400 });
        }

        await connectToDatabase();

        // Check availability globally
        const existingBusiness = await Business.findOne({ subdomain });
        if (existingBusiness && existingBusiness._id.toString() !== session.user.businessId) {
            return NextResponse.json({ success: false, error: "Subdomain is already taken." }, { status: 409 });
        }

        // Update the current business
        const updatedBusiness = await Business.findByIdAndUpdate(
            session.user.businessId,
            { $set: { subdomain } },
            { new: true }
        );

        if (!updatedBusiness) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, subdomain: updatedBusiness.subdomain });
    } catch (error: any) {
        console.error("Error updating domain:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
