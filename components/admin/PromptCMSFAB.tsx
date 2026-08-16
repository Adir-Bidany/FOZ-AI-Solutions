"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, X, LayoutDashboard, Sliders, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PromptCMSFAB() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close menu on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems = [
        {
            label: "דשבורד מנהל ראשי",
            href: "/admin",
            icon: LayoutDashboard,
            activeColor: "bg-blue-500/10 text-blue-500 font-bold",
            hoverColor: "hover:bg-blue-500/10 hover:text-blue-400",
        },
        {
            label: "הגדרות סוכני AI",
            href: "/admin/prompts",
            icon: Sliders,
            activeColor: "bg-purple-500/10 text-purple-500 font-bold",
            hoverColor: "hover:bg-purple-500/10 hover:text-purple-400",
        },
        {
            label: "כלכלת AI וצריכת אסימונים",
            href: "/admin/economics",
            icon: Zap,
            activeColor: "bg-amber-500/10 text-amber-500 font-bold",
            hoverColor: "hover:bg-amber-500/10 hover:text-amber-400",
        },
    ];

    return (
        <div ref={menuRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end" dir="rtl">
            {/* Animated Popover Navigation Menu */}
            {isMenuOpen && (
                <div className="mb-3 w-64 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.25)] p-2 space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
                            תפריט ניהול מהיר
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-muted-foreground hover:text-foreground text-xs p-1 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs transition-colors",
                                    isActive ? item.activeColor : `text-foreground/80 ${item.hoverColor}`
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-current" : "text-muted-foreground")} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <span className="mr-auto w-1.5 h-1.5 rounded-full bg-current" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Circular FAB Toggle Button */}
            <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border cursor-pointer",
                    isMenuOpen
                        ? "bg-foreground text-background border-foreground scale-105"
                        : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-white/20 hover:scale-105 shadow-[0_10px_25px_-5px_rgba(147,51,234,0.4)]"
                )}
                title="תפריט ניהול מהיר"
            >
                {isMenuOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <Settings className="w-5 h-5 animate-spin-slow" />
                )}
            </button>
        </div>
    );
}
