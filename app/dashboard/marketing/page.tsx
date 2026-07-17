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

export default async function MarketingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return redirect("/login");

    await connectDB();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
    if (!business) return redirect("/onboarding");

    // Fetch Insights from DB
    const rawInsights = await AgentInsight.find({ businessId: business._id, agentName: "Michal", status: { $in: ["approved", "pending"] } })
        .sort({ createdAt: -1 })
        .lean();
    
    // Serialize for Client Component
    const insights = JSON.parse(JSON.stringify(rawInsights));

    return (
        <div className="p-8 space-y-8 relative min-h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-3xl shadow-sm shrink-0">
                    🚀
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">מיכל - ניהול שיווק</h1>
                    <p className="text-gray-500">האסטרטגיה הדיגיטלית והתוכן השיווקי שלך במקום אחד</p>
                </div>
                <div className="md:mr-auto mt-4 md:mt-0">
                    <Link href="/dashboard">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md w-full md:w-auto transition-colors">
                            <MessageSquare size={18} /> בקשי תוכן חדש ממיכל
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
                
                {insights.length === 0 ? (
                    <div className="bg-gradient-to-b from-gray-50 to-white rounded-3xl p-12 border border-dashed border-indigo-200 text-center flex flex-col items-center justify-center text-gray-500 h-[28rem] shadow-sm">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">מרכז התוכן שלך עדיין ריק</h3>
                        <p className="text-base mt-2 max-w-md text-gray-500 leading-relaxed">
                            הפוסטים השיווקיים, הרעיונות לקמפיינים והטיפים שמיכל תייצר עבורך יופיעו כאן לאחר אישור של מנהלת המערכת (גולדה).
                        </p>
                        <Link href="/dashboard" className="mt-8">
                            <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl px-6">
                                <MessageSquare size={18} /> התחילי שיחה עכשיו
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
                                agentName="Michal"
                                status={insight.status}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
