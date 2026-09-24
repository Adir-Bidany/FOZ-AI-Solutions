"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { BellRing, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function WaitlistAlert() {
    const [notifiedEntry, setNotifiedEntry] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const checkWaitlist = async () => {
            try {
                const res = await fetch("/api/customer/waitlist/notified");
                const data = await res.json();
                if (data.success && data.entry) {
                    setNotifiedEntry(data.entry);
                }
            } catch (err) {
                // Silent fail
            }
        };
        checkWaitlist();
    }, []);

    const handleAccept = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/customer/waitlist/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waitlistId: notifiedEntry._id, action: "accept" }),
            });
            const data = await res.json();
            
            if (res.status === 409) {
                toast.error(data.error);
                setNotifiedEntry(null);
            } else if (res.ok && data.success) {
                toast.success("התור נקבע בהצלחה!");
                setNotifiedEntry(null);
            } else {
                toast.error(data.error || "שגיאה באישוש התור");
            }
        } catch (error) {
            toast.error("שגיאה בחיבור לשרת");
        } finally {
            setIsLoading(false);
            router.refresh();
        }
    };

    const handleDecline = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/customer/waitlist/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ waitlistId: notifiedEntry._id, action: "decline" }),
            });
            if (res.ok) {
                toast.success("ויתרת על התור");
                setNotifiedEntry(null);
            }
        } catch (error) {
            // Ignore
        } finally {
            setIsLoading(false);
            router.refresh();
        }
    };

    if (!notifiedEntry) return null;

    return (
        <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <BellRing className="w-5 h-5 text-primary animate-bounce" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">התפנה תור שרצית!</h3>
                    <p className="text-sm text-muted-foreground">
                        תאריך: <span className="font-semibold text-foreground">{notifiedEntry.offeredSlot?.date}</span> בשעה: <span className="font-semibold text-foreground">{notifiedEntry.offeredSlot?.startTime}</span>
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
                <Button 
                    variant="default" 
                    className="flex-1 md:flex-none gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleAccept}
                    disabled={isLoading}
                >
                    <CheckCircle className="w-4 h-4" />
                    אשר תור
                </Button>
                <Button 
                    variant="outline" 
                    className="flex-1 md:flex-none gap-2 hover:bg-destructive/10 hover:text-destructive border-border"
                    onClick={handleDecline}
                    disabled={isLoading}
                >
                    <XCircle className="w-4 h-4" />
                    וותר על התור
                </Button>
            </div>
        </div>
    );
}
