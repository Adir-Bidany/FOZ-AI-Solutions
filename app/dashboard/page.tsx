import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Calendar,
    TrendingUp,
    Bell,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { notFound, redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import ActionCard from "@/models/ActionCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ActionCardGrid from "@/components/dashboard/ActionCardGrid";
import { fetchActionCards } from "@/actions/dashboard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import AgentRoom from "@/components/dashboard/AgentRoom";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "בוקר טוב";
    if (hour >= 12 && hour < 18) return "צהריים טובים";
    if (hour >= 18 && hour < 22) return "ערב טוב";
    return "לילה טוב";
}

export default async function ClientDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    await connectDB();
    // Use Business model instead of Client
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();

    console.log("DEBUG DATA:", {
        ownerName: business?.ownerName,
        businessName: business?.businessName,
        // @ts-ignore
        rawBusinessObj: business
    });

    if (!business) {
        return notFound();
    }

    // Serialize business data
    const serializedBusiness = JSON.parse(JSON.stringify(business));

    // Fetch Action Cards (Zone A)
    // Note: fetchActionCards now uses the new ActionCard model
    const actionCards = await fetchActionCards(business._id.toString());

    // Calculate pending actions count
    const pendingCount = actionCards.filter((c: any) => c.status === 'pending').length;

    const greeting = getGreeting();

    const stats = [
        {
            label: "פעולות להיום",
            value: pendingCount > 0 ? `${pendingCount} ממתינות` : "אין משימות",
            change: "הכי חשוב",
            icon: Bell,
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
        {
            label: "הכנסות החודש",
            value: "₪0",
            change: "התחלה חדשה",
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-100",
        },
        {
            label: "תורים עתידיים",
            value: "0",
            change: "מחכה ללידים",
            icon: Calendar,
            color: "text-purple-600",
            bg: "bg-purple-100",
        },
    ];

    // --- SMART DATA LOGIC START ---
    let safeOwnerName = serializedBusiness.ownerName || "יקירה";
    // Check for generic placeholders (including full string "בעלת העסק")
    if (["בעלת", "בעלת העסק", "Owner"].includes(safeOwnerName.trim())) {
        safeOwnerName = "יקירה";
    }
    const firstName = safeOwnerName.split(" ")[0];

    // Note: businessName logic is handled in Layout for Sidebar, 
    // but we can apply it here if needed for other components
    // --- SMART DATA LOGIC END ---

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-right" dir="rtl">
            <main className="flex-1 p-4 lg:p-8 w-full transition-all duration-300">

                <DashboardHeader
                    greeting={greeting}
                    ownerName={firstName}
                    clientSlug={serializedBusiness.slug}
                    clientData={serializedBusiness}
                />

                {/* ZONE A: Action Center */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell className="text-purple-600" size={20} />
                        מרכז הפעולות (Action Center)
                    </h2>
                    <ActionCardGrid cards={actionCards} />
                </div>

                {/* סטטיסטיקות */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                    {stats.map((stat, i) => (
                        <Card
                            key={i}
                            className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl overflow-hidden group"
                        >
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">
                                        {stat.label}
                                    </p>
                                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                                        {stat.value}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full mt-3 inline-block border border-gray-100 group-hover:border-gray-200 transition-colors">
                                        {stat.change}
                                    </span>
                                </div>
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <stat.icon size={28} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ZONE B: Agent Room & Tips */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 h-auto xl:h-[650px]">

                    {/* Agent Room (Tabs) */}
                    <div className="xl:col-span-2 h-[600px] xl:h-full flex flex-col space-y-4">
                        <AgentRoom businessId={business._id.toString()} />
                    </div>

                    {/* Sidebar (Tips & Team Status) */}
                    <div className="space-y-6 h-full flex flex-col">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden shrink-0 transition-transform hover:scale-[1.02] duration-300">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <div className="flex items-center gap-2 mb-4 opacity-90 relative z-10">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Sparkles size={12} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    טיפ יומי ממיכל
                                </span>
                            </div>
                            <p className="text-base font-medium leading-relaxed mb-6 relative z-10">
                                "יום חמישי מתקרב והיומן ב-70% תפוסה. זה הזמן
                                המושלם לסטורי של 'לקוחה מרוצה' כדי למלא את
                                השאר!"
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full bg-white text-purple-700 hover:bg-purple-50 border-none font-bold text-sm shadow-sm relative z-10 h-10 rounded-xl"
                            >
                                תכיני לי את הסטורי הזה ✨
                            </Button>
                        </div>

                        <Card className="border-none shadow-sm rounded-3xl bg-white flex-1 overflow-hidden flex flex-col min-h-[300px]">
                            <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50">
                                <CardTitle className="text-lg font-bold text-gray-900 flex items-center justify-between">
                                    <span>הצוות שלך</span>
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        3 פעילים
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 divide-y divide-gray-50 flex-1 overflow-y-auto custom-scrollbar">
                                {[
                                    {
                                        name: "דניאלה",
                                        role: "מנהלת קבלה",
                                        status: "זמינה",
                                        statusColor: "bg-green-500",
                                        avatarColor:
                                            "bg-purple-100 text-purple-600",
                                        icon: "👩‍💼",
                                    },
                                    {
                                        name: "מיכל",
                                        role: "מנהלת שיווק",
                                        status: "פעילה",
                                        statusColor: "bg-green-500",
                                        avatarColor:
                                            "bg-pink-100 text-pink-600",
                                        icon: "🚀",
                                    },
                                    {
                                        name: "רועי",
                                        role: "אנליסט עסקי",
                                        status: "זמין",
                                        statusColor: "bg-green-500",
                                        avatarColor:
                                            "bg-blue-100 text-blue-600",
                                        icon: "📈",
                                    },
                                ].map((agent, i) => (
                                    <div
                                        key={i}
                                        className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-default group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${agent.avatarColor} group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                {agent.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-900">
                                                    {agent.name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {agent.role}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                                            <span
                                                className={`w-2 h-2 rounded-full ${agent.statusColor} animate-pulse`}
                                            ></span>
                                            <span className="text-gray-600">
                                                {agent.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <AnalyticsSection />
            </main>
        </div>
    );
}
