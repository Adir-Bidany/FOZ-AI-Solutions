"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Link as LinkIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import ThemeToggle from "@/components/ThemeToggle";
import ClientLogo from "@/components/ClientLogo";

interface GlobalHeaderProps {
    clientData?: {
        businessName?: string;
        slug?: string;
        ownerName?: string;
        logo?: string;
    };
    /** Business slug passed from the server layout (replaces useSession) */
    sessionBusinessId?: string;
}

export default function GlobalHeader({ clientData, sessionBusinessId }: GlobalHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [adminError, setAdminError] = useState<string | null>(null);

    const isDashboard = pathname?.startsWith("/dashboard");
    const isClientSite = pathname?.startsWith("/c/");

    // If on a public client landing page (e.g. /c/[slug]), hide platform header
    if (isClientSite) {
        return null;
    }

    const clientSlug = clientData?.slug || sessionBusinessId || "demo";
    const businessName = clientData?.businessName || "העסק שלי";
    const businessLogo = clientData?.logo || (clientData as any)?.landing_page_data?.hero_image_url || null;

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword.trim() === "123456") {
            document.cookie = "admin_access=true; path=/; max-age=86400";
            setIsAdminModalOpen(false);
            setAdminPassword("");
            setAdminError(null);
            router.push("/admin");
        } else {
            setAdminError("סיסמה שגויה");
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all overflow-hidden text-foreground shrink-0">
                <div className="container mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">

                    {/* --- RIGHT SIDE (RTL Start): Primary Brand / Business Context --- */}
                    <div className="flex items-center gap-3 shrink-0">
                        {!isDashboard ? (
                            /* LANDING PAGE: FOZ AI Solutions logo on the RIGHT (RTL Start) */
                            <Link href="/" className="hover:opacity-90 transition-opacity flex items-center h-full">
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
                                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-muted/20 border border-border/40 p-0.5">
                                    <ClientLogo src={businessLogo} businessName={businessName} />
                                </div>
                                <span className="font-bold text-lg md:text-xl truncate text-foreground">
                                    {businessName}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* --- LEFT SIDE (RTL End): Actions / Divider / Theme Toggle --- */}
                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        {!isDashboard && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setAdminPassword("");
                                    setAdminError(null);
                                    setIsAdminModalOpen(true);
                                }}
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                title="גישת מנהל (Admin)"
                            >
                                <ShieldCheck className="h-5 w-5" />
                            </Button>
                        )}

                        {isDashboard && (
                            <Link href={`/c/${clientSlug}`} target="_blank">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 gap-2 rounded-xl border-border text-xs md:text-sm font-medium px-4 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <LinkIcon size={16} /> <span className="hidden sm:inline">עמוד נחיתה</span>
                                </Button>
                            </Link>
                        )}

                        <div className="h-6 w-px bg-border/80 hidden sm:block" />

                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Admin Quick-Access Password Modal */}
            <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
                <DialogContent className="sm:max-w-md bg-card text-card-foreground border-border rounded-2xl p-6" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                            <ShieldCheck className="w-5 h-5 text-purple-500" />
                            כניסת מנהל מערכת
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">
                            הזינו סיסמת מנהל כדי לעבור בדחיפות לדשבורד הניהול המרכזי.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAdminLogin} className="space-y-4 mt-2">
                        <div>
                            <Input
                                type="password"
                                placeholder="הזן סיסמת מנהל..."
                                value={adminPassword}
                                onChange={(e) => {
                                    setAdminPassword(e.target.value);
                                    setAdminError(null);
                                }}
                                autoFocus
                                className="rounded-xl border-border bg-background text-foreground"
                            />
                            {adminError && (
                                <p className="text-xs text-red-500 font-medium mt-1.5">{adminError}</p>
                            )}
                        </div>

                        <DialogFooter className="flex gap-2 sm:justify-start">
                            <Button type="submit" className="w-full sm:w-auto rounded-xl font-bold bg-primary text-primary-foreground">
                                כניסה למערכת
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
