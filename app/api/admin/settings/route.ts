import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import SystemSettings from "@/models/SystemSettings";
import { getToken } from "next-auth/jwt";

// Helper to check admin access
async function checkAdminAuth(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const adminCookie = req.cookies.get("admin_access")?.value;
    if (!adminCookie && (!token || token.role !== "admin")) {
        return false;
    }
    return true;
}

export async function GET(req: NextRequest) {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        await connectDB();
        let settings = await SystemSettings.findOne({});
        
        // Seed default settings if they don't exist
        if (!settings) {
            settings = await SystemSettings.create({
                pricing: { basic: 149, pro: 299, enterprise: 599 }
            });
        }

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Failed to fetch system settings:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch system settings" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { pricing } = body;

        await connectDB();
        let settings = await SystemSettings.findOne({});

        if (!settings) {
            settings = new SystemSettings();
        }

        if (pricing) {
            if (pricing.basic !== undefined) settings.pricing.basic = pricing.basic;
            if (pricing.pro !== undefined) settings.pricing.pro = pricing.pro;
            if (pricing.enterprise !== undefined) settings.pricing.enterprise = pricing.enterprise;
        }

        await settings.save();
        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Failed to update system settings:", error);
        return NextResponse.json({ success: false, error: "Failed to update system settings" }, { status: 500 });
    }
}