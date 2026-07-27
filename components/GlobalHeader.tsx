"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import ClientLogo from "@/components/ClientLogo";

interface GlobalHeaderProps {
    clientData?: {
        businessName?: string;
        slug?: string;
        ownerName?: string;
        logo?: string;
    };
    /** Mobile hamburger trigger injected from the server layout */
    mobileSidebarTrigger?: React.ReactNode;
}

export default function GlobalHeader({ clientData, mobileSidebarTrigger }: GlobalHeaderProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isDashboard = pathname?.startsWith("/dashboard");
    const isClientSite = pathname?.startsWith("/c/");

    // If on a public client landing page (e.g. /c/demo), hide platform header
    if (isClientSite) {
        return null;
    }

    const clientSlug = clientData?.slug || session?.user?.businessId || "demo";
    const businessName = clientData?.businessName || "העסק שלי";
    const businessLogo = clientData?.logo || null;

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all overflow-hidden text-foreground shrink-0">
            <div className="container mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">

                {/* --- RIGHT SIDE (RTL Start): Primary Brand / Business Context --- */}
                <div className="flex items-center gap-3 shrink-0">
                    {!isDashboard ? (
                        /* LANDING PAGE: FOZ AI Solutions logo on the RIGHT (RTL Start) */
                        <Link href="/" className="hover:opacity-90 transition-opacity flex items-center h-full">
                            {/* Phase B fix: step-based responsive width instead of hardcoded w-[450px] */}
                            <div className="relative w-48 md:w-72 lg:w-[450px] h-16 md:h-20 py-1">
                                <Image
                                    src="/logo.png"
                                    alt="FOZ AI Solutions"
                                    fill
                                    className="object-contain object-right"
                                    priority
                                />
                            </div>
                        </Link>
                    ) : (
                        /* DASHBOARD: Business Owner's Logo & Name on the RIGHT (RTL Start) */
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0">
                                <ClientLogo src={businessLogo} businessName={businessName} />
                            </div>
                            <span className="font-bold text-lg md:text-xl truncate text-foreground">
                                {businessName}
                            </span>
                        </div>
                    )}
                </div>

                {/* --- LEFT SIDE (RTL End): Secondary Brand / Actions / Theme Toggle --- */}
                <div className="flex items-center gap-3 md:gap-5 shrink-0">
                    {isDashboard && (
                        <>
                            <Link href={`/c/${clientSlug}`} target="_blank">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 gap-2 rounded-xl border-border text-xs md:text-sm font-medium px-4"
                                >
                                    <LinkIcon size={16} /> <span className="hidden sm:inline">צפה באתר שלי</span>
                                </Button>
                            </Link>

                            {/* FOZ AI Solutions Logo on the LEFT (RTL End) in Dashboard */}
                            {/* Phase C fix: border-r pr-4 mr-1 → border-s ps-4 ms-1 (RTL logical) */}
                            <Link href="/" className="hover:opacity-90 transition-opacity hidden md:flex items-center border-s border-border ps-4 ms-1">
                                <div className="relative w-48 h-14">
                                    <Image
                                        src="/logo.png"
                                        alt="FOZ AI Solutions"
                                        fill
                                        className="object-contain object-left"
                                    />
                                </div>
                            </Link>
                        </>
                    )}

                    <ThemeToggle />

                    {/* Mobile hamburger — only rendered on dashboard, injected from layout */}
                    {isDashboard && mobileSidebarTrigger}
                </div>
            </div>
        </header>
    );
}
