import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function GET(req: NextRequest) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/integrations/meta/callback`;
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");

    if (errorParam || !code) {
        console.error("[Meta Callback] OAuth error or missing code:", errorParam);
        return NextResponse.redirect(`${baseUrl}/dashboard/marketing?error=META_AUTH_CANCELED`);
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.redirect(`${baseUrl}/login`);
        }

        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;

        if (!appId || !appSecret) {
            return NextResponse.redirect(`${baseUrl}/dashboard/marketing?error=MISSING_META_KEYS`);
        }

        // 1. Exchange OAuth code for User Access Token
        const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&client_secret=${appSecret}&code=${code}`;

        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.access_token) {
            console.error("[Meta Callback] Failed to get user token:", tokenData);
            return NextResponse.redirect(`${baseUrl}/dashboard/marketing?error=TOKEN_EXCHANGE_FAILED`);
        }

        const shortLivedToken = tokenData.access_token;

        // 2. Exchange short-lived token for Long-Lived User Token (60 days)
        const longTokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
        const longTokenRes = await fetch(longTokenUrl);
        const longTokenData = await longTokenRes.json();
        const userAccessToken = longTokenData.access_token || shortLivedToken;

        // 3. Fetch Accounts / Pages linked to user
        const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${userAccessToken}`;
        const pagesRes = await fetch(pagesUrl);
        const pagesData = await pagesRes.json();

        if (!pagesData.data || pagesData.data.length === 0) {
            console.warn("[Meta Callback] No Facebook Pages found for user");
            return NextResponse.redirect(`${baseUrl}/dashboard/marketing?error=NO_FACEBOOK_PAGE_FOUND`);
        }

        // Use the first connected page with valid token
        const selectedPage = pagesData.data[0];
        const pageId = selectedPage.id;
        const pageName = selectedPage.name;
        const pageAccessToken = selectedPage.access_token || userAccessToken;

        const instagramAccount = selectedPage.instagram_business_account;
        const instagramAccountId = instagramAccount?.id || undefined;
        const instagramUsername = instagramAccount?.username || undefined;

        await connectToDatabase();
        const business = await Business.findOne({ ownerEmail: session.user.email });

        if (!business) {
            return NextResponse.redirect(`${baseUrl}/dashboard/marketing?error=BUSINESS_NOT_FOUND`);
        }

        // Save Meta API credentials securely
        business.api_keys = business.api_keys || {};
        business.api_keys.meta = {
            accessToken: pageAccessToken,
            facebookPageId: pageId,
            facebookPageName: pageName,
            instagramAccountId: instagramAccountId,
            instagramUsername: instagramUsername,
            tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            isConnected: true,
        };

        await business.save();

        return NextResponse.redirect(`${baseUrl}/dashboard/marketing?meta_connected=true`);
    } catch (error: any) {
        console.error("[Meta Callback GET Error]:", error);
        return NextResponse.redirect(`${baseUrl}/dashboard/marketing?error=META_CALLBACK_FAILED`);
    }
}
