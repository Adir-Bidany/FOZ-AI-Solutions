import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const business = await Business.findOne({ ownerEmail: session.user.email });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        if (business.api_keys?.meta) {
            business.api_keys.meta.isConnected = false;
            business.api_keys.meta.accessToken = undefined;
            business.api_keys.meta.facebookPageId = undefined;
            business.api_keys.meta.facebookPageName = undefined;
            business.api_keys.meta.instagramAccountId = undefined;
            business.api_keys.meta.instagramUsername = undefined;
            await business.save();
        }

        return NextResponse.json({ success: true, message: "Meta account disconnected successfully" });
    } catch (error: any) {
        console.error("[Meta Disconnect DELETE Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
