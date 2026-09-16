"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CalendarOff } from "lucide-react";
import { useRouter } from "next/navigation";

interface BlockTimeModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
}

export default function BlockTimeModal({ open, onOpenChange }: BlockTimeModalProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isFullDay, setIsFullDay] = useState(false);
    const [form, setForm] = useState({
        date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        startTime: "09:00",
        endTime: "18:00",
        reason: "",
    });

    const handleSave = async () => {
        if (!form.date) {
            toast.error("יש לבחור תאריך לחסימה");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/calendar/block", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: form.date,
                    isFullDay,
                    startTime: isFullDay ? null : form.startTime,
                    endTime: isFullDay ? null : form.endTime,
                    reason: form.reason.trim() || "חסימת יומן",
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("היומן נחסם בהצלחה!");
                onOpenChange(false);
                setForm({ date: new Date().toISOString().split("T")[0], startTime: "09:00", endTime: "18:00", reason: "" });
                setIsFullDay(false);
                router.refresh();
            } else {
                toast.error("שגיאה ביצירת החסימה", { description: data.error });
            }
        } catch {
            toast.error("שגיאת תקשורת. אנא נסה שנית.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                            <CalendarOff size={18} />
                        </div>
                        <DialogTitle className="text-xl font-bold">חסימת יומן / יום חופש</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="block-date" className="font-semibold text-sm">תאריך</Label>
                        <Input
                            id="block-date"
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                            className="h-10 rounded-xl"
                        />
                    </div>

                    {/* Full Day Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-slate-50">
                        <div>
                            <p className="font-semibold text-sm">חסימת יום שלם</p>
                            <p className="text-xs text-slate-500 mt-0.5">חסום את כל שעות הפעילות של היום</p>
                        </div>
                        <Switch
                            id="full-day"
                            checked={isFullDay}
                            onCheckedChange={setIsFullDay}
                        />
                    </div>

                    {/* Time Range — shown only when not full-day */}
                    {!isFullDay && (
                        <div className="space-y-1.5">
                            <Label className="font-semibold text-sm">שעות חסימה</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="time"
                                    value={form.startTime}
                                    onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="h-10 flex-1 rounded-xl text-center"
                                />
                                <span className="text-slate-400 font-medium">עד</span>
                                <Input
                                    type="time"
                                    value={form.endTime}
                                    onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="h-10 flex-1 rounded-xl text-center"
                                />
                            </div>
                        </div>
                    )}

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <Label htmlFor="block-reason" className="font-semibold text-sm">
                            סיבה (רשות)
                        </Label>
                        <Textarea
                            id="block-reason"
                            placeholder="לדוגמה: ביקור אצל רופא, יום משפחה, חג..."
                            value={form.reason}
                            onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                            rows={2}
                            className="rounded-xl resize-none"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        ביטול
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <CalendarOff className="w-4 h-4 ml-2" />}
                        חסום יומן
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
