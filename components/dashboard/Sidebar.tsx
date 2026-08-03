"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Users,
    Megaphone,
    Settings,
    LogOut,
    Sparkles,
    Crown,
    Globe,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import ClientLogo from "@/components/ClientLogo";
import { signOut } from "next-auth/react";
import { archiveCurrentSession } from "@/actions/dashboard";

interface SidebarProps {
    client: {
        _id?: string;
        businessName: string;
        slug: string;
        ownerName: string;
        logo?: string;
    };
}

/** Shared nav content rendered inside both the desktop sidebar and floating BrandingAnchor menu */
export function SidebarContent({
    client,
    onNavClick,
}: {
    client: SidebarProps["client"];
    onNavClick?: () => void;
}) {
    const handleLogout = async () => {
        if (client?._id) {
            try {
                await archiveCurrentSession(client._id, "golda");
            } catch (e) {
                console.error("Failed to archive chat session on logout:", e);
            }
        }
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <div className="flex flex-col h-full bg-card text-card-foreground">
            {/* Business identity header */}
            <div className="p-6 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 shrink-0">
                    <ClientLogo src={client.logo || null} businessName={client.businessName} />
                </div>
                <span className="font-bold text-lg truncate text-foreground">
                    {client.businessName}
                </span>
            </div>

            {/* Navigation links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <Link href="/dashboard" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 font-semibold text-foreground hover:bg-primary/10 hover:text-primary h-12 rounded-xl"
                    >
                        <Sparkles size={20} /> המשרד שלי
                    </Button>
                </Link>

                <Link href="/dashboard/calendar" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground h-12 rounded-xl"
                    >
                        <Calendar size={20} /> יומן תורים
                    </Button>
                </Link>

                <Link href="/dashboard/customers" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground h-12 rounded-xl"
                    >
                        <Users size={20} /> לקוחות
                    </Button>
                </Link>

                <Link href="/dashboard/marketing" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground h-12 rounded-xl"
                    >
                        <Megaphone size={20} /> שיווק ותוכן
                    </Button>
                </Link>

                <Link href="/dashboard/website" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground h-12 rounded-xl"
                    >
                        <Globe size={20} /> עמוד נחיתה
                    </Button>
                </Link>

                <Link href="/dashboard/growth" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground h-12 rounded-xl"
                    >
                        <TrendingUp size={20} /> צמיחה וידע
                    </Button>
                </Link>

                <div className="pt-4 mt-4 border-t border-border space-y-2">
                    <Link href="/dashboard/settings" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground h-12 rounded-xl"
                        >
                            <Settings size={20} /> הגדרות
                        </Button>
                    </Link>

                    <Link href="/pricing" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 font-semibold text-primary hover:bg-primary/10 h-12 rounded-xl"
                        >
                            <Crown size={20} /> שדרוג חבילה
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border bg-muted/30">
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-100 dark:border-red-900 bg-card h-10 rounded-xl"
                >
                    <LogOut size={16} /> התנתקות
                </Button>
            </div>
        </div>
    );
}

/** Desktop sidebar — hidden on mobile, visible at lg+ */
export default function Sidebar({ client }: SidebarProps) {
    return (
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-s border-border h-full">
            <SidebarContent client={client} />
        </aside>
    );
}
