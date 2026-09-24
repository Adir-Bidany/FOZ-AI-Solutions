"use client";

import { useState, useEffect } from "react";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerAndSubscribeToPush } from "@/lib/push-client";
import { toast } from "sonner";

export default function PushPromptBusinessBanner() {
    const [show, setShow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && 'Notification' in window) {
            if (Notification.permission === "default") {
                const dismissed = localStorage.getItem("foz_business_push_dismissed");
                if (!dismissed) {
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
                toast.success("נהדר! תקבל עדכונים חשובים מהמערכת.");
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
        localStorage.setItem("foz_business_push_dismissed", "true");
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 mb-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h4 className="font-bold text-foreground">הפעל התראות דפדפן</h4>
                    <p className="text-xs text-muted-foreground">הישאר מעודכן בפיצ'רים חדשים והודעות מערכת חשובות ישירות למסך שלך.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Button 
                    variant="default" 
                    onClick={handleEnable}
                    disabled={isLoading}
                    className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                >
                    {isLoading ? "מפעיל..." : "הפעל התראות"}
                </Button>
                <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-accent">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
