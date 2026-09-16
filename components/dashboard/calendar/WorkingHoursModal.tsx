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
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export interface WorkingHourEntry {
    day: number;
    isOpen: boolean;
    startTime: string;
    endTime: string;
}

interface WorkingHoursModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initialHours?: WorkingHourEntry[];
}

const DEFAULT_HOURS: WorkingHourEntry[] = [
    { day: 0, isOpen: true,  startTime: "09:00", endTime: "18:00" },
    { day: 1, isOpen: true,  startTime: "09:00", endTime: "18:00" },
    { day: 2, isOpen: true,  startTime: "09:00", endTime: "18:00" },
    { day: 3, isOpen: true,  startTime: "09:00", endTime: "18:00" },
    { day: 4, isOpen: true,  startTime: "09:00", endTime: "18:00" },
    { day: 5, isOpen: true,  startTime: "09:00", endTime: "13:00" },
    { day: 6, isOpen: false, startTime: "09:00", endTime: "18:00" },
];

export default function WorkingHoursModal({ open, onOpenChange, initialHours }: WorkingHoursModalProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [hours, setHours] = useState<WorkingHourEntry[]>(
        initialHours && initialHours.length === 7
            ? initialHours
            : DEFAULT_HOURS
    );

    const updateDay = (day: number, field: keyof WorkingHourEntry, value: any) => {
        setHours(prev => prev.map(h => h.day === day ? { ...h, [field]: value } : h));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/calendar/working-hours", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workingHours: hours }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("שעות הפעילות עודכנו בהצלחה!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error("שגיאה בשמירת שעות הפעילות");
            }
        } catch {
            toast.error("שגיאת תקשורת. אנא נסה שנית.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">הגדרת שעות פעילות</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    {hours.map((entry) => (
                        <div
                            key={entry.day}
                            className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                                entry.isOpen ? "bg-white border-gray-200" : "bg-slate-50 border-slate-100 opacity-60"
                            }`}
                        >
                            {/* Day Toggle */}
                            <div className="flex items-center gap-2 w-28 shrink-0">
                                <Switch
                                    checked={entry.isOpen}
                                    onCheckedChange={(v) => updateDay(entry.day, "isOpen", v)}
                                    id={`day-${entry.day}`}
                                />
                                <Label
                                    htmlFor={`day-${entry.day}`}
                                    className="font-semibold text-sm cursor-pointer select-none"
                                >
                                    {DAY_NAMES[entry.day]}
                                </Label>
                            </div>

                            {/* Time Inputs */}
                            {entry.isOpen ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        type="time"
                                        value={entry.startTime}
                                        onChange={(e) => updateDay(entry.day, "startTime", e.target.value)}
                                        className="h-8 w-28 text-center rounded-lg text-sm"
                                    />
                                    <span className="text-slate-400 text-sm">—</span>
                                    <Input
                                        type="time"
                                        value={entry.endTime}
                                        onChange={(e) => updateDay(entry.day, "endTime", e.target.value)}
                                        className="h-8 w-28 text-center rounded-lg text-sm"
                                    />
                                </div>
                            ) : (
                                <span className="text-sm text-slate-400 flex-1">סגור</span>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        ביטול
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                        שמור שעות פעילות
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
