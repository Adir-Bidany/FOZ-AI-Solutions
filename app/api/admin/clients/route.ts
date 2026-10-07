import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import ChatExternal from "@/models/ChatExternal";
import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
    // Admin RBAC: signed NextAuth JWT with role=admin only
    if (!(await isAdminRequest(req))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        // שליפת כל הלקוחות, ממוינים מהחדש לישן
        const clients = await Business.find({}).sort({ createdAt: -1 }).lean();

        // 1. קבוצת צבירת כמות השיחות לכל עסק בשאילתת DB בודדת
        const chatCounts = await ChatExternal.aggregate([
            {
                $group: {
                    _id: "$business_id",
                    count: { $sum: 1 },
                },
            },
        ]);

        const countMap: Record<string, number> = {};
        chatCounts.forEach((item: any) => {
            if (item._id) {
                countMap[item._id.toString()] = item.count;
            }
        });

        // 2. מיפוי נתוני הלקוחות המחוטאים
        const sanitizedClients = clients.map((b: any) => ({
            _id: b._id.toString(),
            businessName: b.businessName,
            ownerName: b.ownerName,
            email: b.ownerEmail || b.email,
            slug: b.slug,
            account_status: b.account_status || b.subscriptionStatus || "trial",
            subscription_tier: b.subscription_tier || "pro",
            createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
            totalCustomerChats: countMap[b._id.toString()] || 0,
            integrations: {
                simplybook: !!(b.api_keys?.simplybook?.companyLogin && b.api_keys?.simplybook?.apiKey),
                whatsapp: !!(b.api_keys?.whatsapp && b.api_keys.whatsapp.trim().length > 0),
                facebook: !!(b.api_keys?.meta?.isConnected && b.api_keys?.meta?.facebookPageId),
                instagram: !!(b.api_keys?.meta?.isConnected && b.api_keys?.meta?.instagramAccountId),
            },
        }));

        // 3. כמות פניות פז (Tenant ID: 000000000000000000000000)
        const totalPazLeads = countMap["000000000000000000000000"] || 0;

        return NextResponse.json({
            success: true,
            clients: sanitizedClients,
            totalPazLeads,
        });
    } catch (error) {
        console.error("Admin API Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch clients" },
            { status: 500 }
        );
    }
}
