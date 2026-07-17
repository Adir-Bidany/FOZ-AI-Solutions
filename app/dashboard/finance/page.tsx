import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import AgentInsight from "@/models/AgentInsight";
import InsightCard from "@/components/dashboard/InsightCard";
import Link from "next/link";

export default async function FinancePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return redirect("/login");

    await connectDB();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
    if (!business) return redirect("/onboarding");

    // Fetch Insights from DB
    const rawInsights = await AgentInsight.find({ businessId: business._id, agentName: "Roi", status: { $in: ["approved", "pending"] } })
        .sort({ createdAt: -1 })
        .lean();
    
    // Serialize for Client Component
    const insights = JSON.parse(JSON.stringify(rawInsights));

    return (
        <div className="p-8 space-y-8 relative min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl shadow-sm shrink-0">
                    📈
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">רועי - ניהול פיננסי</h1>
                    <p className="text-gray-500">תובנות כלכליות ודוחות עסקיים במקום אחד</p>
                </div>
                <div className="md:mr-auto mt-4 md:mt-0">
                    <Link href="/dashboard">
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md w-full md:w-auto transition-colors">
                            <MessageSquare size={18} /> התייעץ עם רועי
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Insights Hub */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-blue-500" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">הדוחות והתובנות שלך</h2>
                </div>
                
                {insights.length === 0 ? (
                    <div className="bg-gradient-to-b from-gray-50 to-white rounded-3xl p-12 border border-dashed border-emerald-200 text-center flex flex-col items-center justify-center text-gray-500 h-[28rem] shadow-sm">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">מרכז התובנות הפיננסיות ריק</h3>
                        <p className="text-base mt-2 max-w-md text-gray-500 leading-relaxed">
                            דוחות תקציב, ניתוחי רווחיות, ואסטרטגיות שרועי מפיק עבורך יופיעו כאן לאחר אישור הנהלה.
                        </p>
                        <Link href="/dashboard" className="mt-8">
                            <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl px-6">
                                <MessageSquare size={18} /> התחל שיחה פיננסית
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {insights.map((insight: any) => (
                            <InsightCard
                                key={insight._id}
                                id={insight._id}
                                title={insight.title}
                                content={insight.content}
                                type={insight.type}
                                date={insight.createdAt}
                                agentName="Roi"
                                status={insight.status}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
