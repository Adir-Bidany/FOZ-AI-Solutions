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
    Bot,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
    const pathname = usePathname();

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

    const handleOpenGolda = () => {
        window.dispatchEvent(new CustomEvent("open-golda-modal"));
        onNavClick?.();
    };

    const isActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/dashboard";
        }
        return pathname?.startsWith(href);
    };

    const getNavItemClass = (href: string, isSpecialV2: boolean = false) => {
        const active = isActive(href);

        if (isSpecialV2) {
            return active
                ? "w-full justify-start gap-3 font-extrabold text-purple-600 dark:text-purple-300 bg-purple-500/20 border border-purple-500/40 shadow-sm h-12 rounded-xl"
                : "w-full justify-start gap-3 font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 h-12 rounded-xl border border-purple-500/20 bg-purple-500/5";
        }

        return active
            ? "w-full justify-start gap-3 font-extrabold text-primary bg-primary/15 border border-primary/20 shadow-sm h-12 rounded-xl"
            : "w-full justify-start gap-3 font-semibold text-muted-foreground hover:bg-accent hover:text-foreground h-12 rounded-xl";
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
                        className={getNavItemClass("/dashboard")}
                    >
                        <Sparkles size={20} className={isActive("/dashboard") ? "text-primary" : ""} /> המשרד שלי
                    </Button>
                </Link>

                <Link href="/dashboard/v2" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/v2", true)}
                    >
                        <Sparkles size={20} className="text-purple-500" /> המשרד שלי 2
                    </Button>
                </Link>

                <Button
                    variant="ghost"
                    onClick={handleOpenGolda}
                    className="w-full justify-start gap-3 font-semibold text-foreground hover:bg-purple-500/10 hover:text-purple-600 h-12 rounded-xl"
                >
                    <Bot size={20} className="text-purple-500" /> שיחה עם גולדה
                </Button>

                <Link href="/dashboard/calendar" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/calendar")}
                    >
                        <Calendar size={20} className={isActive("/dashboard/calendar") ? "text-primary" : ""} /> יומן תורים
                    </Button>
                </Link>

                <Link href="/dashboard/customers" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/customers")}
                    >
                        <Users size={20} className={isActive("/dashboard/customers") ? "text-primary" : ""} /> לקוחות
                    </Button>
                </Link>

                <Link href="/dashboard/marketing" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/marketing")}
                    >
                        <Megaphone size={20} className={isActive("/dashboard/marketing") ? "text-primary" : ""} /> שיווק ותוכן
                    </Button>
                </Link>

                <Link href="/dashboard/website" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/website")}
                    >
                        <Globe size={20} className={isActive("/dashboard/website") ? "text-primary" : ""} /> עמוד נחיתה
                    </Button>
                </Link>

                <Link href="/dashboard/growth" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/growth")}
                    >
                        <TrendingUp size={20} className={isActive("/dashboard/growth") ? "text-primary" : ""} /> צמיחה וידע
                    </Button>
                </Link>

                <div className="pt-4 mt-4 border-t border-border space-y-2">
                    <Link href="/dashboard/settings" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className={getNavItemClass("/dashboard/settings")}
                        >
                            <Settings size={20} className={isActive("/dashboard/settings") ? "text-primary" : ""} /> הגדרות
                        </Button>
                    </Link>

                    <Link href="/pricing" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className={getNavItemClass("/pricing")}
                        >
                            <Crown size={20} className={isActive("/pricing") ? "text-primary" : ""} /> שדרוג חבילה
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
