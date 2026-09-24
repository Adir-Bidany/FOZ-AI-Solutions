"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Megaphone, Send } from "lucide-react";

export default function PushBroadcastCard() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error("נא למלא כותרת והודעה.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/business/marketing/push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message }),
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success(`נשלח בהצלחה ל-${data.sentCount} לקוחות!`);
                setTitle("");
                setMessage("");
            } else {
                toast.error(data.error || "שגיאה בשליחת הודעות פוש.");
            }
        } catch (error) {
            toast.error("שגיאת תקשורת עם השרת.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">שליחת הודעות פוש (Push)</h3>
                    <p className="text-sm text-muted-foreground">שלח עדכון או מבצע ישירות לנייד של לקוחות רשומים.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
                <Input 
                    placeholder="כותרת ההודעה (לדוגמה: 30% הנחה היום!)" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                />
                <Textarea 
                    placeholder="תוכן ההודעה..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                    className="resize-none h-24"
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleBroadcast} disabled={isLoading || !title || !message} className="gap-2">
                    {isLoading ? "שולח..." : "שדר עכשיו"}
                    {!isLoading && <Send className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
}
