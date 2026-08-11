"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
    Sparkles,
    SlidersHorizontal,
    ShieldCheck,
    Bot,
    ChevronUp,
    Settings,
    Layers,
    X,
} from "lucide-react";
import PromptCMSModal from "./PromptCMSModal";
import { cn } from "@/lib/utils";

export default function PromptCMSFAB() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    return (
        <div ref={menuRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end" dir="rtl">
            {/* Animated Popover Navigation Menu */}
            {isMenuOpen && (
                <div className="mb-3 w-56 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.25)] p-2 space-y-1 animate-in fade-in slide-in-from-bottom-3 duration-200">
                    <div className="px-3 py-2 border-b border-border/60 mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-foreground tracking-wide flex items-center gap-1.5">
                            
                            תפריט ניהול מהיר
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(false)}
                            className="text-muted-foreground hover:text-foreground text-xs"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Navigation Link 1: Full Dedicated Settings Page */}
                    <Link
                        href="/admin/prompts"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
                    >

                        <span>הגדרות סוכני AI</span>
                    </Link>

                    {/* Navigation Link 2: Admin Dashboard */}
                    <Link
                        href="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                    >

                        <span>דשבורד מנהל</span>
                    </Link>

                    {/* Navigation Action 3: Quick Edit Modal */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsMenuOpen(false);
                            setIsModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-foreground hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-right cursor-pointer"
                    >

                        <span>עריכה מהירה (Modal)</span>
                    </button>
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
                title="תפריט ניהול סוכנים"
            >
                {isMenuOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <Settings className="w-5 h-5 animate-spin-slow" />
                )}
            </button>

            {/* Quick Edit Modal */}
            <PromptCMSModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
