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
        <div className="p-4 lg:p-8 w-full font-sans">
            {/* Structural Wrapper Lock: Header Container */}
            <div className="w-full shrink-0">
                <DashboardHeader
                    greeting={greeting}
                    ownerName={firstName}
                    clientSlug={serializedBusiness.slug}
                    clientData={serializedBusiness}
                />
            </div>

            {/* ZONE A: Action Center */}
            <div className="mb-8">
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

            {/* ZONE B: Agent Room */}
            <div className="w-full h-auto xl:h-[650px] flex flex-col space-y-4">
                <AgentRoom businessId={business._id.toString()} />
            </div>

            <AnalyticsSection />
        </div>
    );
}
