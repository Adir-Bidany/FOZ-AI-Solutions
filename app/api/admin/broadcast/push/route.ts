import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import webpush from "web-push";

// Setup web-push config
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@foz-ai.com";

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();

        // Verify Super Admin
        const caller = await Business.findOne({ ownerEmail: session.user.email });
        if (!caller || caller.role !== "admin") {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { title, message } = body;

        if (!title || !message) {
            return NextResponse.json({ success: false, error: "Missing title or message" }, { status: 400 });
        }

        if (!publicVapidKey || !privateVapidKey) {
            return NextResponse.json({ success: false, error: "Push notifications are not configured on the server." }, { status: 500 });
        }

        // Find all businesses with push subscriptions
        const businesses = await Business.find({
            "pushSubscriptions.0": { $exists: true }
        });

        if (businesses.length === 0) {
            return NextResponse.json({ success: false, error: "No opted-in businesses found." }, { status: 404 });
        }

        let sentCount = 0;
        let expiredEndpoints: string[] = [];

        const payload = JSON.stringify({
            title: title,
            body: message,
            url: `/dashboard`,
            icon: "/icon.png"
        });

        for (const biz of businesses) {
            let subscriptionsChanged = false;

            for (const sub of biz.pushSubscriptions) {
                try {
                    await webpush.sendNotification(
                        { endpoint: sub.endpoint, keys: sub.keys },
                        payload
                    );
                    sentCount++;
                } catch (err: any) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        expiredEndpoints.push(sub.endpoint);
                        subscriptionsChanged = true;
                    }
                }
            }

            if (subscriptionsChanged) {
                biz.pushSubscriptions = biz.pushSubscriptions.filter(
                    (s: any) => !expiredEndpoints.includes(s.endpoint)
                );
                await biz.save();
            }
        }

        return NextResponse.json({ success: true, sentCount });

    } catch (error) {
        console.error("Admin Push API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
