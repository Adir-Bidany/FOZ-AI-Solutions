"use client";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    Calendar,
    Users,
    Megaphone,
    Settings,
    LogOut,
    Sparkles,
    Crown,
    BarChart3,
    Menu,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface MobileMenuProps {
    client: {
        businessName: string;
        slug: string;
        ownerName: string;
    };
}

export default function MobileMenu({ client }: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                <div className="flex flex-col h-full bg-white">
                    <SheetHeader className="p-6 border-b text-right">
                        <SheetTitle className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg uppercase shrink-0 shadow-md">
                                {client.businessName.charAt(0)}
                            </div>
                            <span className="font-bold text-lg truncate text-gray-800">
                                {client.businessName}
                            </span>
                        </SheetTitle>
                    </SheetHeader>

                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                        <Link href={`/dashboard/${client.slug}`} onClick={() => setOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 font-medium text-gray-600 hover:bg-purple-50 hover:text-purple-900 h-12 rounded-xl"
                            >
                                <Sparkles size={20} /> המשרד שלי
                            </Button>
                        </Link>

                        <Link href={`/dashboard/${client.slug}/calendar`} onClick={() => setOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                            >
                                <Calendar size={20} /> יומן תורים
                            </Button>
                        </Link>

                        <Link href={`/dashboard/${client.slug}/clients`} onClick={() => setOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                            >
                                <Users size={20} /> לקוחות
                            </Button>
                        </Link>

                        <Link href={`/dashboard/${client.slug}/marketing`} onClick={() => setOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                            >
                                <Megaphone size={20} /> מיכל (שיווק)
                            </Button>
                        </Link>

                        <Link href={`/dashboard/${client.slug}/finance`} onClick={() => setOpen(false)}>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                            >
                                <BarChart3 size={20} /> רועי (פיננסים)
                            </Button>
                        </Link>

                        <div className="pt-4 mt-4 border-t border-gray-100 space-y-2">
                            <Link href={`/dashboard/${client.slug}/settings`} onClick={() => setOpen(false)}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 h-12 rounded-xl"
                                >
                                    <Settings size={20} /> הגדרות
                                </Button>
                            </Link>

                            <Link href="/pricing" onClick={() => setOpen(false)}>
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
                        <Link href="/login" onClick={() => setOpen(false)}>
                            <Button
                                variant="outline"
                                className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100 bg-white h-10 rounded-xl"
                            >
                                <LogOut size={16} /> התנתקות
                            </Button>
                        </Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
