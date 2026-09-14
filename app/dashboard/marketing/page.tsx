import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import AgentInsight from "@/models/AgentInsight";
import MarketingContentHub from "@/components/dashboard/MarketingContentHub";
import FeatureGate from "@/components/dashboard/FeatureGate";

export default async function MarketingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return redirect("/login");

    // effectiveTier is computed server-side in the JWT callback (BATCH 284):
    // active trial → "enterprise", expired trial → "basic", paid → stored tier.
    const effectiveTier = session.user.effectiveTier ?? "basic";

    await connectDB();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
    if (!business) return redirect("/onboarding");

    // Fetch all approved/non-archived posts
    const rawInsights = await AgentInsight.find({
        businessId: business._id,
        agentName: "Golda",
        type: { $in: ["social_post", "marketing_tip", "campaign_idea"] },
        status: { $in: ["approved", "pending"] }
    })
        .sort({ createdAt: -1 })
        .lean();

    const insights = JSON.parse(JSON.stringify(rawInsights));
    const metaConfig = business.api_keys?.meta ? JSON.parse(JSON.stringify(business.api_keys.meta)) : null;

    return (
        <FeatureGate currentTier={effectiveTier} requiredFeature="MARKETING_HUB">
            <div className="p-4 md:p-8 space-y-8 relative min-h-full">
                <MarketingContentHub
                    initialInsights={insights}
                    initialMetaConfig={metaConfig}
                />
            </div>
        </FeatureGate>
    );
}
