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

// נתונים מדומים (בהמשך נחבר ל-DB האמיתי)
const mockNotifications = [
    {
        id: 1,
        persona: "דניאלה",
        role: "קבלה",
        type: "success",
        title: "3 תורים חדשים נקבעו!",
        content: "הבוקר קבעתי 3 תורים לשבוע הבא. היומן מתמלא יפה.",
        time: "לפני שעה",
    },
    {
        id: 2,
        persona: "מיכל",
        role: "שיווק",
        type: "insight",
        title: "הזדמנות עסקית",
        content:
            'שמתי לב שהרבה לקוחות שואלות על "פיסול אף". אולי כדאי שנעלה פוסט בנושא?',
        time: "לפני 3 שעות",
    },
    {
        id: 3,
        persona: "רועי",
        role: "אנליסט",
        type: "alert",
        title: "ירידה קלה בהכנסות",
        content:
            "השבוע יש ירידה של 10% בהזמנות לעומת שבוע שעבר. ממליץ להוציא הודעת מבצע ללקוחות עבר.",
        time: "אתמול",
    },
    {
        id: 4,
        persona: "דניאלה",
        role: "קבלה",
        type: "info",
        title: "הודעה שלא נענתה",
        content:
            "לקוחה בשם שירן שאלה שאלה רפואית שלא ידעתי לענות עליה. אנא צרי איתה קשר.",
        time: "אתמול",
    },
];

const stats = [
    {
        label: "הכנסות החודש",
        value: "₪24,500",
        change: "+12%",
        icon: TrendingUp,
        color: "text-green-600",
        bg: "bg-green-100",
    },
    {
        label: "תורים עתידיים",
        value: "18",
        change: "+4",
        icon: Calendar,
        color: "text-purple-600",
        bg: "bg-purple-100",
    },
    {
        label: "שיחות עם בוט",
        value: "142",
        change: "+22%",
        icon: MessageSquare,
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
];

export default function ClientDashboard({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    // const { slug } = await params; // נשתמש בזה בהמשך לשליפת הנתונים האמיתיים

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            {/* === סרגל צד (Sidebar) === */}
            <aside className="w-64 bg-white border-l hidden md:flex flex-col fixed h-full right-0 z-10">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                        G
                    </div>
                    <span className="font-bold text-lg">Glow Clinic</span>
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
                        className="w-full justify-start gap-2 text-gray-600"
                    >
                        <Calendar size={18} /> יומן תורים
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-600"
                    >
                        <Users size={18} /> לקוחות
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-600"
                    >
                        <Megaphone size={18} /> שיווק וקמפיינים
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-gray-600"
                    >
                        <Settings size={18} /> הגדרות בוט
                    </Button>
                </nav>

                <div className="p-4 border-t">
                    <Button
                        variant="outline"
                        className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={16} /> התנתקות
                    </Button>
                </div>
            </aside>

            {/* === תוכן ראשי === */}
            <main className="flex-1 md:mr-64 p-4 lg:p-8">
                {/* כותרת וכפתורים */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            בוקר טוב, יעל! ☀️
                        </h1>
                        <p className="text-gray-500">
                            הנה מה שקורה בקליניקה שלך היום.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="gap-2 rounded-full"
                        >
                            <Copy size={16} /> העתק לינק ללקוחות
                        </Button>
                        <Link href="/c/demo" target="_blank">
                            <Button className="gap-2 rounded-full bg-gray-900 text-white hover:bg-gray-800">
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
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                                        {stat.change} מהחודש שעבר
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

                {/* === אזור העדכונים מהצוות (הלב של המערכת) === */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* עמודה ראשית: פיד עדכונים */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <Sparkles
                                    className="text-purple-500"
                                    size={20}
                                />
                                עדכונים מהצוות הדיגיטלי
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {mockNotifications.map((notif) => (
                                <Card
                                    key={notif.id}
                                    className="border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <CardContent className="p-5 flex gap-4">
                                        {/* האווטאר של העוזר */}
                                        <div className="relative">
                                            <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.persona}`}
                                                />
                                                <AvatarFallback>
                                                    {notif.persona[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-white
                                    ${
                                        notif.role === "קבלה"
                                            ? "bg-blue-500"
                                            : notif.role === "שיווק"
                                            ? "bg-pink-500"
                                            : "bg-green-500"
                                    }`}
                                            >
                                                {notif.role === "קבלה"
                                                    ? "📞"
                                                    : notif.role === "שיווק"
                                                    ? "🎨"
                                                    : "📊"}
                                            </div>
                                        </div>

                                        {/* תוכן ההודעה */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                                                        {notif.persona}{" "}
                                                        <span className="text-xs font-normal text-gray-400">
                                                            ({notif.role})
                                                        </span>
                                                    </h4>
                                                    <p className="text-sm font-medium text-gray-800 mt-0.5">
                                                        {notif.title}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {notif.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                "{notif.content}"
                                            </p>

                                            {/* כפתורי פעולה מהירים */}
                                            {notif.type === "insight" && (
                                                <div className="mt-3 flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="h-8 text-xs bg-purple-600 hover:bg-purple-700"
                                                    >
                                                        אישור וביצוע
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-xs"
                                                    >
                                                        התעלם
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* עמודה צדדית: המודלים (הצוות) */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold">הצוות שלך</h2>

                        <Card>
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
                                        status: "במנוחה",
                                        color: "text-gray-400",
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
                                        className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-10 h-10 bg-gray-100">
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
                                                    agent.status === "זמינה" ||
                                                    agent.status === "זמין"
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

                        {/* ווידג'ט טיפ יומי */}
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-2 opacity-90">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    טיפ יומי ממיכל
                                </span>
                            </div>
                            <p className="text-sm font-medium leading-relaxed">
                                "יום חמישי מתקרב והיומן ב-70% תפוסה. זה הזמן
                                המושלם לסטורי של 'לקוחה מרוצה' כדי למלא את
                                השאר!"
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="mt-4 w-full bg-white/20 hover:bg-white/30 text-white border-none text-xs"
                            >
                                תכיני לי את הסטורי הזה
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
