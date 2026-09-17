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
        <div className="relative w-full h-full min-h-[500px] bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col transition-all duration-300">
            
            {!isOpen ? (
                // CLOSED STATE: Centered Premium Glowing Button
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping blur-xl" />
                        <Button 
                            onClick={() => setIsOpen(true)}
                            className="relative w-20 h-20 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105"
                        >
                            <MessageCircle size={32} />
                        </Button>
                    </div>
                    <p className="mt-4 text-sm font-bold text-foreground">לחץ כדי לדבר עם דניאלה</p>
                    <p className="text-xs text-muted-foreground mt-1">העוזרת האישית שלך</p>
                </div>
            ) : (
                // EXPANDED STATE: Full-frame Chat Widget
                <>
                    {/* Optional Header with Close Button */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/20 shrink-0">
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
                        >
                            <X size={18} />
                        </button>
                    </div>
                    
                    {/* The Chat Widget filling the remaining space */}
                    <div className="flex-1 relative overflow-hidden bg-transparent">
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
                </>
            )}
        </div>
    );
}
