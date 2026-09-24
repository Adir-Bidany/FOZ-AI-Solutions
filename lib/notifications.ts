import webpush from "web-push";
import { connectToDatabase } from "@/lib/db";
import Customer from "@/models/Customer";

// Configure web-push with VAPID keys
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:support@foz-ai.com";

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

export async function sendWaitlistPushNotification(consumerIds: string[], businessId: string, date: string, time: string) {
    try {
        if (!publicVapidKey || !privateVapidKey) {
            console.warn("[Waitlist Push] VAPID keys are missing, cannot send push notifications.");
            return;
        }

        await connectToDatabase();

        // Find customers that are in the waitlist matches and have push subscriptions
        const customers = await Customer.find({
            _id: { $in: consumerIds },
            "pushSubscriptions.0": { $exists: true }
        });

        if (!customers || customers.length === 0) {
            console.log("[Waitlist Push] No opted-in consumers found for this waitlist slot.");
            return;
        }

        const payload = JSON.stringify({
            title: "תור חדש התפנה!",
            body: `תור שחיכית לו בתאריך ${date} בשעה ${time} התפנה. היכנס עכשיו כדי לתפוס אותו!`,
            url: "/",
            icon: "/icon.png"
        });

        const sendPromises: Promise<any>[] = [];

        for (const customer of customers) {
            if (customer.pushSubscriptions && Array.isArray(customer.pushSubscriptions)) {
                for (const sub of customer.pushSubscriptions) {
                    sendPromises.push(
                        webpush.sendNotification(
                            { endpoint: sub.endpoint, keys: sub.keys },
                            payload
                        ).catch((err: any) => {
                            if (err.statusCode === 410 || err.statusCode === 404) {
                                console.log(`[Waitlist Push] Subscription expired/invalid for customer ${customer._id}`);
                            }
                            throw err; // Ensure it marks as rejected in allSettled
                        })
                    );
                }
            }
        }

        const results = await Promise.allSettled(sendPromises);
        
        const successful = results.filter(r => r.status === "fulfilled").length;
        const failed = results.filter(r => r.status === "rejected").length;
        
        console.log(`[Waitlist Push] Broadcast complete. Success: ${successful}, Failed: ${failed}`);

    } catch (error) {
        console.error("[Waitlist Push] Error sending waitlist notifications:", error);
    }
}
