"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface GoldaFloatingButtonProps {
    hasUnread: boolean;
    onClick: () => void;
}

export default function GoldaFloatingButton({ hasUnread, onClick }: GoldaFloatingButtonProps) {
    return (
        <div
            className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-2"
            dir="ltr" /* keep physical left regardless of page RTL */
        >
            <div className="group relative">

                {/* ── Outer ambient glow ring (always present, stronger when unread) ── */}
                <div
                    className={`
                        absolute inset-0 rounded-full pointer-events-none
                        bg-gradient-to-br from-purple-600/40 to-indigo-600/40
                        scale-125 blur-md transition-opacity duration-500
                        ${hasUnread ? "opacity-100" : "opacity-0 group-hover:opacity-70"}
                    `}
                />

                {/* ── Ping animation ring (only when unread) ── */}
                {hasUnread && (
                    <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping scale-125 pointer-events-none" />
                )}

                {/* ── Main FAB Button ── */}
                <button
                    id="golda-fab"
                    onClick={onClick}
                    aria-label="פתח שיחה עם גולדה"
                    title="גולדה — עוזרת ה-AI שלך"
                    className="
                        relative w-14 h-14 rounded-full
                        bg-gradient-to-br from-purple-600 to-indigo-600
                        hover:from-purple-500 hover:to-indigo-500
                        text-white
                        flex items-center justify-center
                        shadow-lg shadow-purple-600/40
                        hover:shadow-xl hover:shadow-purple-600/50
                        ring-2 ring-white/10 hover:ring-white/25
                        transition-all duration-300
                        hover:scale-110 active:scale-95
                        focus:outline-none focus:ring-4 focus:ring-purple-500/30
                    "
                >
                    <Sparkles className="w-6 h-6 drop-shadow-sm" />
                </button>

                {/* ── Unread badge ── */}
                {hasUnread && (
                    <span
                        aria-label="יש פעולות ממתינות"
                        className="
                            absolute -top-1 -right-1
                            w-5 h-5 rounded-full
                            bg-red-500 text-white text-[10px] font-black
                            flex items-center justify-center
                            ring-2 ring-background
                            shadow-sm
                        "
                    >
                        !
                    </span>
                )}

                {/* ── Hover tooltip ── */}
                <div
                    className="
                        absolute bottom-full mb-3 left-1/2 -translate-x-1/2
                        opacity-0 group-hover:opacity-100
                        translate-y-1 group-hover:translate-y-0
                        transition-all duration-200
                        pointer-events-none select-none
                        whitespace-nowrap
                    "
                    dir="rtl"
                >
                    <div className="bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-foreground shadow-lg">
                        שוחח עם גולדה
                    </div>
                    {/* Arrow */}
                    <div className="flex justify-center">
                        <div className="w-2 h-2 bg-card border-b border-r border-border rotate-45 -mt-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
