"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, MessageCircle } from "lucide-react";
import UnifiedChatWidget from "@/components/chat/UnifiedChatWidget";
import { cn } from "@/lib/utils";

interface DanielaFABProps {
    businessConfig: any;
}

export default function DanielaFAB({ businessConfig }: DanielaFABProps) {
    const [isOpen, setIsOpen]             = useState(false);
    const [autoSendMsg, setAutoSendMsg]   = useState<string | undefined>(undefined);
    // Key trick: change to force-remount the widget with a fresh autoSendMsg
    const [widgetKey, setWidgetKey]       = useState(0);

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { message?: string } | undefined;
            if (detail?.message) {
                setAutoSendMsg(detail.message);
                setWidgetKey(prev => prev + 1); // remount widget so it picks up the new message
            }
            setIsOpen(true);
        };

        window.addEventListener("open-daniela", handler);
        return () => window.removeEventListener("open-daniela", handler);
    }, []);

    // Clear autoSendMsg once consumed (after widget remounts it will fire once)
    useEffect(() => {
        if (isOpen && autoSendMsg) {
            const timer = setTimeout(() => setAutoSendMsg(undefined), 500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoSendMsg]);

    return (
        <>
            {/* ── Floating Popup ─────────────────────────────────────────── */}
            <div
                className={cn(
                    "fixed bottom-20 left-6 z-50 w-[92vw] max-w-[380px]",
                    "bg-card border border-border rounded-3xl shadow-2xl overflow-hidden",
                    "transition-all duration-300 origin-bottom-left",
                    isOpen
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 scale-90 pointer-events-none"
                )}
                style={{ height: "62vh", minHeight: "360px", maxHeight: "620px" }}
            >
                {/* Popup header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-sm font-bold text-foreground">דניאלה – העוזרת שלי</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="סגור"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Chat widget — remounts on widgetKey change to pick up new autoSendMsg */}
                <div className="flex-1 flex flex-col overflow-hidden h-[calc(100%-49px)]">
                    <UnifiedChatWidget
                        key={widgetKey}
                        mode="public"
                        variant="embedded"
                        businessConfig={businessConfig}
                        agentPersona="daniela"
                        autoSendMessage={autoSendMsg}
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* ── FAB Button ─────────────────────────────────────────────── */}
            <Button
                onClick={() => setIsOpen(prev => !prev)}
                className={cn(
                    "fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-xl",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "transition-all duration-200",
                    isOpen && "rotate-12"
                )}
                size="icon"
                aria-label="פתח שיחה עם דניאלה"
            >
                {isOpen
                    ? <X size={22} />
                    : <MessageCircle size={22} />
                }
            </Button>
        </>
    );
}
