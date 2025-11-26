import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Conversation from "@/models/Conversation";
import ActionCenter from "@/components/ActionCenter"; // הייבוא החדש
import ActionItem from "@/models/ActionItem"; // הייבוא החדש
import {
    Calendar,
    Users,
    TrendingUp,
    Megaphone,
    MessageSquare,
    Settings,
    LogOut,
    Link as LinkIcon,
    Sparkles,
    Menu,
    Crown,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import DashboardChat from "@/components/DashboardChat";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "בוקר טוב";
    if (hour >= 12 && hour < 18) return "צהריים טובים";
    if (hour >= 18 && hour < 22) return "ערב טוב";
    return "לילה טוב";
}

async function getClientData(slug: string) {
    if (slug === "demo") {
        return {
            businessName: "קליניקת הדגמה",
            ownerName: "משתמש דמו",
            slug: "demo",
            integrations: { simplybook: { isConnected: false } },
        };
    }

    await connectDB();
    const client = await Client.findOne({ slug }).lean();
    if (!client) return null;

    return JSON.parse(JSON.stringify(client));
}

export default async function ClientDashboard({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;

    // שליפת נתוני הלקוח
    const client = await getClientData(resolvedParams.slug);

    if (!client) {
        return notFound();
    }

    // --- לוגיקה 1: ספירת שיחות מהיום ---
    let dailyConversationsCount = 0;
    try {
        if (client._id) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            dailyConversationsCount = await Conversation.countDocuments({
                clientId: client._id,
                createdAt: { $gte: startOfDay },
            });
        }
    } catch (error) {
        console.error("Error counting conversations:", error);
    }

    // --- לוגיקה 2: שליפת פעולות ממתינות (Action Items) ---
    let pendingActions: any[] = [];
    try {
        if (client._id) {
            const actionsDocs = await ActionItem.find({
                clientId: client._id,
                status: "pending",
            })
                .sort({ createdAt: -1 })
                .lean();

            pendingActions = JSON.parse(JSON.stringify(actionsDocs));
        }
    } catch (error) {
        console.error("Error fetching actions:", error);
    }
    // ----------------------------------------------------

    const greeting = getGreeting();

    const stats = [
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
        {
            label: "שיחות עם FOZ",
            value: dailyConversationsCount.toString(),
            change: "מהיום",
            icon: MessageSquare,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg uppercase shrink-0 shadow-md">
                    {client.businessName.charAt(0)}
                </div>
                <span className="font-bold text-lg truncate text-gray-800">
                    {client.businessName}
                </span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <Button
                    variant="secondary"
                    className="w-full justify-start gap-3 font-medium bg-purple-50 text-purple-900 hover:bg-purple-100 h-12 rounded-xl"
                >
                    <Sparkles size={20} /> המשרד שלי
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                >
                    <Calendar size={20} /> יומן תורים
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                >
                    <Users size={20} /> לקוחות
                </Button>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                >
                    <Megaphone size={20} /> שיווק
                </Button>

                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                    <Link href={`/dashboard/${client.slug}/settings`}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                        >
                            <Settings size={20} /> הגדרות חיבורים
                        </Button>
                    </Link>

                    <Link href="/pricing">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-12 rounded-xl"
                        >
                            <Crown size={20} /> שדרוג חבילה
                        </Button>
                    </Link>
                </div>
            </nav>

            <div className="p-4 border-t bg-gray-50/50">
                <Link href="/login">
                    <Button
                        variant="outline"
                        className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 bg-white h-10 rounded-xl"
                    >
                        <LogOut size={16} /> התנתקות
                    </Button>
                </Link>
            </div>
        </div>
    );

    return (
        <div
            className="min-h-screen bg-gray-50 flex font-sans text-right"
            dir="rtl"
        >
            <main className="flex-1 p-4 lg:p-8 w-full transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-md border border-gray-100 sticky top-4 z-20">
                    <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">👋</span> {greeting},{" "}
                        {client.ownerName.split(" ")[0]}!
                    </h1>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-gray-100 rounded-full"
                            >
                                <Menu size={24} className="text-gray-600" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="p-0 w-80 border-l-0"
                        >
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="mb-8">
                    <Link href={`/c/${client.slug}`} target="_blank">
                        <Button className="w-full h-12 gap-2 rounded-xl bg-gray-900 text-white shadow-md text-base font-medium">
                            <LinkIcon size={18} /> צפה באתר שלי
                        </Button>
                    </Link>
                </div>

                {/* --- מרכז הפעולות (האלמנט החדש) --- */}
                {/* יופיע רק אם יש פעולות, או שהקומפוננטה תטפל בזה */}
                <div className="mb-8">
                    <ActionCenter initialActions={pendingActions} />
                </div>
                {/* ---------------------------------- */}

                {/* סטטיסטיקות */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
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
                                    <h3 className="text-3xl font-bold text-gray-900 tracking-tight">
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

                {/* אזור ראשי: צ'אט וטיפים */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8 h-auto xl:h-[650px]">
                    <div className="xl:col-span-2 h-[500px] md:h-[600px] xl:h-full flex flex-col space-y-4">
                        <div className="flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                    <Sparkles size={18} />
                                </div>
                                חדר המצב (הצוות הדיגיטלי)
                            </h2>
                        </div>
                        <div className="flex-1 overflow-hidden rounded-3xl shadow-sm border border-gray-200 bg-white h-full relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent pointer-events-none z-10 h-6" />
                            <DashboardChat businessConfig={client} />
                        </div>
                    </div>

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
            </main>
        </div>
    );
}
