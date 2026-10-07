import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import AgentInsight from "@/models/AgentInsight";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { insightId, platform } = body;

        if (!insightId || !["facebook", "instagram"].includes(platform)) {
            return NextResponse.json(
                { error: "Invalid parameters. 'insightId' and 'platform' (facebook|instagram) are required." },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const business = await Business.findOne({ ownerEmail: session.user.email });
        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const metaConfig = business.api_keys?.meta;
        if (!metaConfig || !metaConfig.isConnected || !metaConfig.accessToken) {
            return NextResponse.json(
                { error: "NOT_CONNECTED", message: "חשבון Meta אינו מחובר. אנא התחבר מחדש בדשבורד השיווק." },
                { status: 400 }
            );
        }

        const insight = await AgentInsight.findOne({ _id: insightId, business_id: business._id });
        if (!insight) {
            return NextResponse.json({ error: "Insight post not found or unauthorized" }, { status: 404 });
        }

        const postMessage = `${insight.title}\n\n${insight.content}`;
        const imageUrl = insight.imageUrl;

        // --- PUBLISH TO FACEBOOK PAGE ---
        if (platform === "facebook") {
            if (!metaConfig.facebookPageId) {
                return NextResponse.json(
                    { error: "MISSING_PAGE_ID", message: "לא נמצא עמוד פייסבוק מחובר לחשבון זה." },
                    { status: 400 }
                );
            }

            let fbPublishUrl = `https://graph.facebook.com/v19.0/${metaConfig.facebookPageId}/feed`;
            let payload: any = {
                message: postMessage,
                access_token: metaConfig.accessToken,
            };

            if (imageUrl) {
                fbPublishUrl = `https://graph.facebook.com/v19.0/${metaConfig.facebookPageId}/photos`;
                payload = {
                    caption: postMessage,
                    url: imageUrl,
                    access_token: metaConfig.accessToken,
                };
            }

            const fbRes = await fetch(fbPublishUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const fbData = await fbRes.json();

            if (!fbRes.ok || fbData.error) {
                console.error("[Facebook Publish Error]:", fbData);
                return NextResponse.json(
                    { error: fbData.error?.message || "תקלה בפרסום בעמוד הפייסבוק." },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                postId: fbData.id || fbData.post_id,
                message: "הפוסט פורסם בהצלחה בעמוד הפייסבוק!",
            });
        }

        // --- PUBLISH TO INSTAGRAM BUSINESS ACCOUNT ---
        if (platform === "instagram") {
            if (!metaConfig.instagramAccountId) {
                return NextResponse.json(
                    { error: "MISSING_INSTAGRAM_ID", message: "לא נמצא חשבון אינסטגרם עסקי מחובר (Instagram Business Account)." },
                    { status: 400 }
                );
            }

            if (!imageUrl) {
                return NextResponse.json(
                    { error: "IMAGE_REQUIRED", message: "אינסטגרם מחייב תמונה בפוסט. צור פוסט כולל תמונת AI לפרסום באינסטגרם." },
                    { status: 400 }
                );
            }

            // Step 1: Create Media Container
            const createContainerUrl = `https://graph.facebook.com/v19.0/${metaConfig.instagramAccountId}/media`;
            const containerRes = await fetch(createContainerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    image_url: imageUrl,
                    caption: postMessage,
                    access_token: metaConfig.accessToken,
                }),
            });

            const containerData = await containerRes.json();

            if (!containerRes.ok || !containerData.id) {
                console.error("[Instagram Container Error]:", containerData);
                return NextResponse.json(
                    { error: containerData.error?.message || "תקלה ביצירת הפוסט באינסטגרם." },
                    { status: 500 }
                );
            }

            // Step 2: Publish Media Container
            const publishUrl = `https://graph.facebook.com/v19.0/${metaConfig.instagramAccountId}/media_publish`;
            const publishRes = await fetch(publishUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    creation_id: containerData.id,
                    access_token: metaConfig.accessToken,
                }),
            });

            const publishData = await publishRes.json();

            if (!publishRes.ok || !publishData.id) {
                console.error("[Instagram Publish Error]:", publishData);
                return NextResponse.json(
                    { error: publishData.error?.message || "תקלה בפרסום הסופי באינסטגרם." },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                postId: publishData.id,
                message: "הפוסט פורסם בהצלחה בחשבון האינסטגרם!",
            });
        }
    } catch (error: any) {
        console.error("[Marketing Publish API Error]:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
