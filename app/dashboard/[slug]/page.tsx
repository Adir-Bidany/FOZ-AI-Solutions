import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Calendar,
    Users,
    TrendingUp,
    Megaphone,
    MessageSquare,
    Settings,
    LogOut,
    Copy,
    Link as LinkIcon,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import DashboardChat from "@/components/DashboardChat"; // <--- הייבוא של הרכיב החדש

// פונקציה לחישוב ברכה לפי שעה
function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "בוקר טוב";
    if (hour >= 12 && hour < 18) return "צהריים טובים";
    if (hour >= 18 && hour < 22) return "ערב טוב";
    return "לילה טוב";
}

async function getClientData(slug: string) {
    await connectDB();
    const client = await Client.findOne({ slug }).lean();
    if (!client) return null;

    // המרה של האובייקט ל-JSON פשוט כדי למנוע בעיות עם תאריכים ב-Next.js
    return JSON.parse(JSON.stringify(client));
}

export default async function ClientDashboard({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const client = await getClientData(resolvedParams.slug);

    if (!client) {
        return notFound();
    }

    const greeting = getGreeting();

    // סטטיסטיקות (בינתיים פיקטיביות)
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
            label: "שיחות עם בוט",
            value: "0",
            change: "מתחילים",
            icon: MessageSquare,
            color: "text-blue-600",
            bg: "bg-blue-100",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* === סרגל צד === */}
            <aside className="w-64 bg-white border-l hidden md:flex flex-col fixed h-full right-0 z-10 shadow-sm">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold uppercase shrink-0">
                        {client.businessName.charAt(0)}
                    </div>
                    <span className="font-bold text-lg truncate">
                        {client.businessName}
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-2 font-medium bg-purple-50 text-purple-900"
                    >
                        <Sparkles size={18} /> המשרד שלי
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-600 hover:bg-gray-50"
                    >
                        <Calendar size={18} /> יומן תורים
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-600 hover:bg-gray-50"
                    >
                        <Users size={18} /> לקוחות
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-600 hover:bg-gray-50"
                    >
                        <Megaphone size={18} /> שיווק
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-600 hover:bg-gray-50"
                    >
                        <Settings size={18} /> הגדרות
                    </Button>
                </nav>

                <div className="p-4 border-t">
                    <Link href="/login">
                        <Button
                            variant="outline"
                            className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                        >
                            <LogOut size={16} /> התנתקות
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* === תוכן ראשי === */}
            <main className="flex-1 md:mr-64 p-4 lg:p-8">
                {/* כותרת דינמית */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {greeting}, {client.ownerName}! ☀️
                        </h1>
                        <p className="text-gray-500">
                            ברוכה הבאה לדשבורד הניהול שלך.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/c/${client.slug}`} target="_blank">
                            <Button className="gap-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all">
                                <LinkIcon size={16} /> צפה באתר שלי
                            </Button>
                        </Link>
                    </div>
                </header>

                {/* כרטיסי סטטיסטיקה */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <Card
                            key={i}
                            className="border-none shadow-sm hover:shadow-md transition-shadow"
                        >
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        {stat.label}
                                    </p>
                                    <h3 className="text-2xl font-bold">
                                        {stat.value}
                                    </h3>
                                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                                        {stat.change}
                                    </span>
                                </div>
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}
                                >
                                    <stat.icon size={24} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* === אזור העבודה המרכזי (עם הצ'אט החי) === */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
                    {/* עמודה ראשית: הצ'אט עם הצוות */}
                    <div className="lg:col-span-2 h-full flex flex-col space-y-4">
                        <div className="flex items-center justify-between shrink-0">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                                <Sparkles
                                    className="text-purple-500"
                                    size={20}
                                />
                                חדר המצב (הצוות הדיגיטלי)
                            </h2>
                        </div>

                        {/* הטמעת רכיב הצ'אט החכם */}
                        <div className="flex-1 overflow-hidden rounded-2xl shadow-sm border border-gray-200">
                            <DashboardChat businessConfig={client} />
                        </div>
                    </div>

                    {/* עמודה צדדית: טיפ יומי וקיצורים */}
                    <div className="space-y-6 h-full overflow-y-auto">
                        {/* ווידג'ט טיפ יומי */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-3 opacity-90">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    טיפ יומי ממיכל
                                </span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed mb-4">
                                "יום חמישי מתקרב והיומן ב-70% תפוסה. זה הזמן
                                המושלם לסטורי של 'לקוחה מרוצה' כדי למלא את
                                השאר!"
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="w-full bg-white/20 hover:bg-white/30 text-white border-none text-xs backdrop-blur-sm"
                            >
                                תכיני לי את הסטורי הזה
                            </Button>
                        </div>

                        {/* רשימת המודלים (רק לתצוגה יפה) */}
                        <Card className="border-none shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    סטטוס הצוות
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 divide-y">
                                {[
                                    {
                                        name: "דניאלה",
                                        role: "מנהלת קבלה",
                                        status: "זמינה",
                                        color: "text-green-500",
                                    },
                                    {
                                        name: "מיכל",
                                        role: "מנהלת שיווק",
                                        status: "פעילה",
                                        color: "text-green-500",
                                    },
                                    {
                                        name: "רועי",
                                        role: "אנליסט עסקי",
                                        status: "זמין",
                                        color: "text-green-500",
                                    },
                                ].map((agent, i) => (
                                    <div
                                        key={i}
                                        className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 bg-gray-100">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${agent.name}`}
                                                />
                                                <AvatarFallback>
                                                    {agent.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {agent.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {agent.role}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-medium">
                                            <span
                                                className={`w-2 h-2 rounded-full ${
                                                    agent.color ===
                                                    "text-green-500"
                                                        ? "bg-green-500"
                                                        : "bg-gray-300"
                                                }`}
                                            ></span>
                                            {agent.status}
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
