import { Button } from "@/components/ui/button";
import {
    Calendar,
    Users,
    Megaphone,
    Settings,
    LogOut,
    Sparkles,
    Crown,
    BarChart3, // For Finance
    Globe,
} from "lucide-react";
import Link from "next/link";
import ClientLogo from "@/components/ClientLogo";

interface SidebarProps {
    client: {
        businessName: string;
        slug: string;
        ownerName: string;
        logo?: string;
    };
}

export default function Sidebar({ client }: SidebarProps) {
    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-100">
            <div className="p-6 border-b flex items-center gap-3">
                <div className="w-10 h-10 shrink-0">
                    <ClientLogo src={client.logo || null} businessName={client.businessName} />
                </div>
                <span className="font-bold text-lg truncate text-gray-800">
                    {client.businessName}
                </span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-900 h-12 rounded-xl"
                    >
                        <Sparkles size={20} /> המשרד שלי
                    </Button>
                </Link>

                <Link href="/dashboard/calendar">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                    >
                        <Calendar size={20} /> יומן תורים
                    </Button>
                </Link>

                <Link href="/dashboard/customers">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                    >
                        <Users size={20} /> לקוחות
                    </Button>
                </Link>

                <Link href="/dashboard/marketing">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                    >
                        <Megaphone size={20} /> מיכל (שיווק)
                    </Button>
                </Link>

                <Link href="/dashboard/finance">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                    >
                        <BarChart3 size={20} /> רועי (פיננסים)
                    </Button>
                </Link>

                <Link href="/dashboard/website">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                    >
                        <Globe size={20} /> עמוד נחיתה
                    </Button>
                </Link>

                <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                    <Link href="/dashboard/settings">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                        >
                            <Settings size={20} /> הגדרות
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
}
