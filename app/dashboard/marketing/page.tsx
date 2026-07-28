import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import AgentInsight from "@/models/AgentInsight";
import { fetchPendingAssets } from "@/actions/dashboard";
import MarketingContentHub from "@/components/dashboard/MarketingContentHub";
import Link from "next/link";

export default async function MarketingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return redirect("/login");

    await connectDB();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
    if (!business) return redirect("/onboarding");

    // Fetch Pending Assets from DB
    const pendingAssets = await fetchPendingAssets(business._id.toString());

    // Fetch Approved Insights from DB
    const rawInsights = await AgentInsight.find({
        businessId: business._id,
        agentName: "Golda",
        type: { $in: ["social_post", "marketing_tip", "campaign_idea"] },
        status: { $in: ["approved", "pending"] }
    })
        .sort({ createdAt: -1 })
        .lean();
    
    // Serialize for Client Component
    const approvedInsights = JSON.parse(JSON.stringify(rawInsights));

    return (
        <div className="p-4 md:p-8 space-y-8 relative min-h-full">
            {/* Header */}
            

            {/* Insights Hub */}
            <div className="space-y-4">
                <MarketingContentHub
                    initialPendingAssets={pendingAssets}
                    approvedInsights={approvedInsights}
                />
            </div>
        </div>
    );
}
