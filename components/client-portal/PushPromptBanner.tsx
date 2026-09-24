"use client";

import { useState, useEffect } from "react";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerAndSubscribeToPush } from "@/lib/push-client";
import { toast } from "sonner";

export default function PushPromptBanner() {
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Only show if not already subscribed or denied
        if (typeof window !== "undefined" && 'Notification' in window) {
            if (Notification.permission === "default") {
                // We haven't asked yet
                const dismissed = localStorage.getItem("foz_push_dismissed");
                if (!dismissed) {
                    // Small delay to not overwhelm on first render
                    const t = setTimeout(() => setShow(true), 2000);
                    return () => clearTimeout(t);
                }
            }
        }
    }, []);

    const handleEnable = async () => {
        setIsLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                await registerAndSubscribeToPush();
                toast.success("מעולה! נעדכן אותך כשיתפנו תורים.");
                setShow(false);
            } else {
                toast.error("הרשאות להתראות נדחו.");
                setShow(false);
            }
        } catch (error) {
            toast.error("שגיאה בהפעלת התראות.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = () => {
        localStorage.setItem("foz_push_dismissed", "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="w-full bg-accent/30 border border-accent rounded-xl p-3 flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-foreground">קבל התראות לנייד</h4>
                    <p className="text-xs text-muted-foreground">נדע לעדכן אותך ברגע שיתפנה תור שרצית!</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="h-8 text-xs"
                >
                    {isLoading ? "מפעיל..." : "הפעל התראות"}
                </Button>
                <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
