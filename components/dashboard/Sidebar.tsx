"use client";

import React from "react";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ClientLogo from "@/components/ClientLogo";
import { signOut, useSession } from "next-auth/react";
import { archiveCurrentSession } from "@/actions/dashboard";
import FeatureGate from "@/components/dashboard/FeatureGate";
import { type SubscriptionTier } from "@/lib/config/tiers";

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
    const { data: sessionData } = useSession();

    // effectiveTier is pre-computed server-side in the JWT callback (BATCH 284).
    // Fall back to "basic" while the session is loading so gated links stay hidden during hydration.
    const effectiveTier: SubscriptionTier =
        (sessionData?.user?.effectiveTier as SubscriptionTier | undefined) ?? "basic";

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

    const getNavItemClass = (href: string) => {
        const active = isActive(href);

        return active
            ? "w-full justify-start px-6 font-extrabold text-primary bg-primary/15 border border-primary/20 shadow-sm h-12 rounded-xl"
            : "w-full justify-start px-6 font-semibold text-muted-foreground hover:bg-accent hover:text-foreground h-12 rounded-xl";
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
                    > המשרד שלי
                    </Button>
                </Link>

                <FeatureGate currentTier={effectiveTier} requiredFeature="GOLDA_CHAT" silent>
                    <Button
                        variant="ghost"
                        onClick={handleOpenGolda}
                        className="w-full justify-start px-6 font-semibold text-foreground hover:bg-purple-500/10 hover:text-purple-600 h-12 rounded-xl"
                    > צ'אט עם גולדה
                    </Button>
                </FeatureGate>

                <FeatureGate currentTier={effectiveTier} requiredFeature="CALENDAR_SYNC" silent>
                    <Link href="/dashboard/calendar" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className={getNavItemClass("/dashboard/calendar")}
                        > יומן תורים
                        </Button>
                    </Link>
                </FeatureGate>

                <Link href="/dashboard/customers" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/customers")}
                    > לקוחות
                    </Button>
                </Link>

                <FeatureGate currentTier={effectiveTier} requiredFeature="MARKETING_HUB" silent>
                    <Link href="/dashboard/marketing" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className={getNavItemClass("/dashboard/marketing")}
                        > שיווק ותוכן
                        </Button>
                    </Link>
                </FeatureGate>

                <Link href="/dashboard/website" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/website")}
                    > עמוד נחיתה
                    </Button>
                </Link>

                <Link href="/dashboard/growth" onClick={onNavClick}>
                    <Button
                        variant="ghost"
                        className={getNavItemClass("/dashboard/growth")}
                    > מסע ללקוח
                    </Button>
                </Link>

                <div className="pt-4 mt-4 border-t border-border space-y-2">
                    <Link href="/dashboard/settings" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className={getNavItemClass("/dashboard/settings")}
                        > הגדרות העסק
                        </Button>
                    </Link>

                    <Link href="/pricing" onClick={onNavClick}>
                        <Button
                            variant="ghost"
                            className={getNavItemClass("/pricing")}
                        > שדרוג חבילה
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-border bg-muted/30">
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-100 dark:border-red-900 bg-card h-10 rounded-xl"
                > התנתקות
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
