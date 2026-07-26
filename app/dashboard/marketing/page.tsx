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
        <div className="p-8 space-y-8 relative min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-3xl shadow-sm shrink-0">
                    🚀
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">גולדה - שיווק ותוכן</h1>
                    <p className="text-gray-500">האסטרטגיה הדיגיטלית והתוכן השיווקי שלך במקום אחד</p>
                </div>
                <div className="md:mr-auto mt-4 md:mt-0">
                    <Link href="/dashboard">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md w-full md:w-auto transition-colors">
                            <MessageSquare size={18} /> בקשי תוכן שיווקי מגולדה
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Insights Hub */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-pink-500" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">ההצעות והתוכן השיווקי שלך</h2>
                </div>
                
                <MarketingContentHub
                    initialPendingAssets={pendingAssets}
                    approvedInsights={approvedInsights}
                />
            </div>
        </div>
    );
}
