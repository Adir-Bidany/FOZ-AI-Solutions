"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Megaphone, Send, ShieldAlert } from "lucide-react";

export default function PushBroadcastAdmin() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleBroadcast = async () => {
        if (!title.trim() || !message.trim()) {
            toast.error("נא למלא כותרת והודעה.");
            return;
        }

        if (!confirm("האם אתה בטוח שברצונך לשלוח הודעת פוש לכל בעלי העסקים?")) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/broadcast/push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message }),
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success(`נשלח בהצלחה ל-${data.sentCount} עסקים!`);
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
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 flex flex-col gap-4 shadow-sm" dir="rtl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5 text-destructive" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">שידור הודעת מערכת (Super Admin)</h3>
                    <p className="text-sm text-muted-foreground">שלח הודעת פוש גלובלית לכל בעלי העסקים במערכת.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
                <Input 
                    placeholder="כותרת ההודעה (לדוגמה: עדכון גרסה חדש!)" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    className="border-destructive/20 focus-visible:ring-destructive"
                />
                <Textarea 
                    placeholder="תוכן ההודעה..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoading}
                    className="resize-none h-24 border-destructive/20 focus-visible:ring-destructive"
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button onClick={handleBroadcast} disabled={isLoading || !title || !message} variant="destructive" className="gap-2">
                    {isLoading ? "שולח לכולם..." : "שדר לכלל המערכת"}
                    {!isLoading && <Send className="w-4 h-4" />}
                </Button>
            </div>
        </div>
    );
}
