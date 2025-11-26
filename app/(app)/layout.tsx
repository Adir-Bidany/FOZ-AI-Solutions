import { notFound } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    Menu,
    Sparkles,
    Calendar,
    Users,
    Megaphone,
    Settings,
    Crown,
    LogOut,
    Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
// ניהול סשן - נצטרך קוד צד שרת כדי לשלוף את ה-slug
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { getServerSession } from "next-auth"; // דרוש ייבוא

// נניח שיש לנו פונקציה לשליפת נתונים אם ה-slug לא נמצא בסשן
async function getClientDataFromSession(session: any) {
    // הפונקציה הזו צריכה לרוץ בצד השרת כדי להחליף את client.slug
    // לצורך הדגמה, נשתמש ב-slug מהסשן
    return {
        businessName: "קליניקת הדגמה",
        ownerName: session?.user?.name || "משתמשת",
        slug: session?.user?.slug || "demo",
    };
}

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // לצורך הדגמה, אנחנו מניחים שה-session זמין.
    // בפועל, אתה צריך להשתמש ב-getServerSession
    const session = {
        user: { name: "שיר", slug: "shir-clinic" }, // דאמי סשן
    };

    if (!session?.user?.slug) {
        // אם אין סשן, נפנה לדף הבית (המידול שלך)
        // return redirect('/login');
    }

    const client = await getClientDataFromSession(session);
    const greeting = "צהריים טובים"; // נניח שאנחנו לא מחשבים פה

    // רכיב הניווט (לשימוש חוזר)
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

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <Link href={`/dashboard/${client.slug}`}>
                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-3 font-medium bg-purple-50 text-purple-900 hover:bg-purple-100 h-12 rounded-xl"
                    >
                        <Sparkles size={20} /> המשרד שלי
                    </Button>
                </Link>
                {/* ... קישורים נוספים כפי שמופיעים ב-SidebarContent המקורי ... */}

                <Link href="/pricing">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-12 rounded-xl"
                    >
                        <Crown size={20} /> שדרוג חבילה
                    </Button>
                </Link>

                {/* קישור לאתר הלקוחה - נפתח בחלון חדש */}
                <a
                    href={`/c/${client.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                    >
                        <LinkIcon size={20} /> צפה באתר שלי
                    </Button>
                </a>
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

    // Header/Navbar עבור כל המערכת המחוברת
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
            {/* Header גלובלי לכל המערכת המחוברת */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    {/* המבורגר (גלוי תמיד) */}
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

                    {/* ברכת הפנים (מוצג מימין) */}
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        👋 {greeting}, {client.ownerName.split(" ")[0]}!
                    </h1>
                </div>
            </header>

            <main className="flex-1 w-full p-4 lg:p-8">{children}</main>
        </div>
    );
}
