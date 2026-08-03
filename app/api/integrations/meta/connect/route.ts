import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const appId = process.env.FACEBOOK_APP_ID;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUri = `${baseUrl}/api/integrations/meta/callback`;

        if (!appId) {
            return NextResponse.redirect(new URL("/dashboard/marketing?error=MISSING_META_KEYS", req.url));
        }

        const scopes = [
            "pages_manage_posts",
            "pages_read_engagement",
            "pages_show_list",
            "instagram_basic",
            "instagram_content_publish",
        ].join(",");

        const fbAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&scope=${scopes}&response_type=code`;

        return NextResponse.redirect(fbAuthUrl);
    } catch (error) {
        console.error("[Meta Connect GET Error]:", error);
        return NextResponse.redirect(new URL("/dashboard/marketing?error=AUTH_INIT_FAILED", req.url));
    }
}
