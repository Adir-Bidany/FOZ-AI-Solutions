import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import Customer from "@/models/Customer";
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

        const body = await req.json();
        const { title, message } = body;

        if (!title || !message) {
            return NextResponse.json({ success: false, error: "Missing title or message" }, { status: 400 });
        }

        if (!publicVapidKey || !privateVapidKey) {
            return NextResponse.json({ success: false, error: "Push notifications are not configured on the server." }, { status: 500 });
        }

        await connectToDatabase();

        const business = await Business.findOne({ ownerEmail: session.user.email });
        if (!business) {
            return NextResponse.json({ success: false, error: "Business not found" }, { status: 404 });
        }

        // Find all customers of this business who have push subscriptions
        const optedInCustomers = await Customer.find({
            business_id: business._id,
            "pushSubscriptions.0": { $exists: true }
        });

        if (optedInCustomers.length === 0) {
            return NextResponse.json({ success: false, error: "No opted-in customers found." }, { status: 404 });
        }

        let sentCount = 0;
        let expiredEndpoints: string[] = [];

        // Broadcast to all
        const payload = JSON.stringify({
            title: title,
            body: message,
            url: `/${business.slug}`,
            icon: business.logo || "/icon.png"
        });

        for (const customer of optedInCustomers) {
            let subscriptionsChanged = false;

            for (const sub of customer.pushSubscriptions) {
                try {
                    await webpush.sendNotification(
                        { endpoint: sub.endpoint, keys: sub.keys },
                        payload
                    );
                    sentCount++;
                } catch (err: any) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired or no longer valid, we should remove it
                        expiredEndpoints.push(sub.endpoint);
                        subscriptionsChanged = true;
                    }
                }
            }

            // Cleanup stale endpoints dynamically
            if (subscriptionsChanged) {
                customer.pushSubscriptions = customer.pushSubscriptions.filter(
                    (s: any) => !expiredEndpoints.includes(s.endpoint)
                );
                await customer.save();
            }
        }

        return NextResponse.json({ success: true, sentCount });

    } catch (error) {
        console.error("Marketing Push API Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
