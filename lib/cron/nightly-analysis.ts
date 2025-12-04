import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import ChatExternal from "@/models/ChatExternal";
import InsightsLog from "@/models/InsightsLog";
import { processSessionSummary } from "@/lib/services/orchestrator";

export async function runNightlyAnalysis() {
    console.log("[Nightly Job] Starting analysis...");
    await connectToDatabase();

    // 1. Fetch all active businesses
    const businesses = await Business.find({ subscriptionStatus: "active" });

    for (const business of businesses) {
        console.log(`[Nightly Job] Processing business: ${business.businessName}`);

        // 2. Fetch unproccessed chats for today
        const unprocessedChats = await ChatExternal.find({
            business_id: business._id,
            processed_for_insights: false
        });

        console.log(`[Nightly Job] Found ${unprocessedChats.length} new chats.`);

        for (const chat of unprocessedChats) {
            try {
                // 3. Trigger Orchestrator (Michal/Roi analysis -> Golda decision)
                await processSessionSummary(chat._id.toString());

                // 4. Mark as processed
                chat.processed_for_insights = true;
                await chat.save();
            } catch (error) {
                console.error(`[Nightly Job] Error processing chat ${chat._id}:`, error);
            }
        }

        // 5. Generate Daily Summary Log (Michal/Roi)
        // Placeholder: In a real app, we would aggregate insights here.
        await InsightsLog.create({
            business_id: business._id,
            agent_persona: "michal",
            summary: `Processed ${unprocessedChats.length} chats. No major marketing trends detected today.`,
            metrics: { chats_analyzed: unprocessedChats.length }
        });
    }

    console.log("[Nightly Job] Analysis complete.");
}
