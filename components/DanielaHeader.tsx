"use client";

import React from "react";
import ClientLogo from "@/components/ClientLogo";

interface DanielaHeaderProps {
    businessName?: string;
    logoUrl?: string | null;
}

export default function DanielaHeader({ businessName, logoUrl }: DanielaHeaderProps) {
    const logoSrc = logoUrl || "/logo.png";

    return (
        <div className="bg-card/95 border-b border-border/80 text-foreground p-4 rounded-t-[2.5rem] flex items-center justify-between gap-4 shrink-0" dir="rtl">
            {/* Right Side (RTL Start): Upright Business Logo + Title & Status */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-border/60 bg-muted/20 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                    <ClientLogo src={logoSrc} businessName={businessName || "העסק שלי"} />
                </div>

                <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">
                        דניאלה
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs text-muted-foreground font-medium">
                            זמינה כעת
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
