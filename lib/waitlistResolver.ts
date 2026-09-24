import { connectToDatabase } from "@/lib/db";
import Waitlist from "@/models/Waitlist";
import { sendWaitlistPushNotification } from "@/lib/notifications";

export async function resolveWaitlist(businessId: string, dateStr: string, startTime: string) {
    try {
        await connectToDatabase();

        const hour = parseInt(startTime.split(":")[0], 10);
        let timeOfDay = "any";
        if (hour >= 6 && hour < 12) timeOfDay = "morning";
        else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
        else if (hour >= 17) timeOfDay = "evening";

        const query = {
            business_id: businessId,
            status: "waiting",
            $and: [
                {
                    $or: [
                        { preferred_dates: { $size: 0 } },
                        { preferred_dates: dateStr }
                    ]
                },
                {
                    $or: [
                        { preferred_time_of_day: "any" },
                        { preferred_time_of_day: timeOfDay }
                    ]
                }
            ]
        };

        // Find all matches
        const matches = await Waitlist.find(query);

        if (matches.length > 0) {
            console.log(`[WaitlistResolver] Found ${matches.length} matching waitlist entries.`);
            
            // Extract consumer IDs
            const consumerIds = matches
                .filter(m => m.user_id)
                .map(m => m.user_id!.toString());

            // Update all to "notified"
            await Waitlist.updateMany(
                { _id: { $in: matches.map(m => m._id) } },
                {
                    $set: {
                        status: "notified",
                        notified_at: new Date(),
                        offeredSlot: {
                            date: dateStr,
                            startTime
                        }
                    }
                }
            );

            // Broadcast
            if (consumerIds.length > 0) {
                await sendWaitlistPushNotification(consumerIds, businessId, dateStr, startTime);
            }
        } else {
            console.log(`[WaitlistResolver] No matching waitlist entries found for ${dateStr} at ${startTime}.`);
        }
    } catch (error) {
        console.error("[WaitlistResolver] Error resolving waitlist:", error);
    }
}
