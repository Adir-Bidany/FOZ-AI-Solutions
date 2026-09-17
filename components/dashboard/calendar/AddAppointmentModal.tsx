"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface AddAppointmentModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initialDate?: string;
    initialTime?: string;
}

export default function AddAppointmentModal({ open, onOpenChange, initialDate, initialTime }: AddAppointmentModalProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    
    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        service: "",
        date: "",
        time: "",
        endTime: "",
    });

    // Reset form when opened with new initial values
    useEffect(() => {
        if (open) {
            const startDate = initialDate || new Date().toISOString().split("T")[0];
            const startTime = initialTime || "09:00";
            
            // Calculate default end time (+1 hour)
            const [h, m] = startTime.split(":").map(Number);
            const endHour = Math.min(23, h + 1).toString().padStart(2, "0");
            const endTime = `${endHour}:${m.toString().padStart(2, "0")}`;

            setForm({
                customerName: "",
                customerPhone: "",
                service: "",
                date: startDate,
                time: startTime,
                endTime: endTime,
            });
        }
    }, [open, initialDate, initialTime]);

    // Auto-update end time when start time changes manually
    const handleTimeChange = (newTime: string) => {
        const [h, m] = newTime.split(":").map(Number);
        if (!isNaN(h) && !isNaN(m)) {
            const endHour = Math.min(23, h + 1).toString().padStart(2, "0");
            const endTime = `${endHour}:${m.toString().padStart(2, "0")}`;
            setForm(prev => ({ ...prev, time: newTime, endTime }));
        } else {
            setForm(prev => ({ ...prev, time: newTime }));
        }
    };

    const handleSave = async () => {
        if (!form.date || !form.time || !form.endTime) {
            toast.error("יש לבחור תאריך ושעות");
            return;
        }

        const startDateTime = new Date(`${form.date}T${form.time}`);
        if (startDateTime < new Date()) {
            toast.error("לא ניתן לקבוע תור בזמן עבר");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/calendar/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: form.date,
                    time: form.time,
                    endTime: form.endTime,
                    service_name: form.service,
                    customer_name: form.customerName,
                    customer_phone: form.customerPhone,
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("התור נקבע בהצלחה!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error("שגיאה בקביעת התור", { description: data.error });
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
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <Plus size={18} />
                        </div>
                        <DialogTitle className="text-xl font-bold">הוספת תור חדש</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="customer-name" className="font-semibold text-sm">שם הלקוח/ה</Label>
                            <Input
                                id="customer-name"
                                placeholder="לדוגמה: ישראל ישראלי"
                                value={form.customerName}
                                onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="customer-phone" className="font-semibold text-sm">טלפון</Label>
                            <Input
                                id="customer-phone"
                                placeholder="05X-XXXXXXX"
                                value={form.customerPhone}
                                onChange={(e) => setForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                                className="h-10 rounded-xl"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Service */}
                    <div className="space-y-1.5">
                        <Label htmlFor="service-name" className="font-semibold text-sm">סוג שירות/טיפול</Label>
                        <Input
                            id="service-name"
                            placeholder="לדוגמה: פגישת ייעוץ"
                            value={form.service}
                            onChange={(e) => setForm(prev => ({ ...prev, service: e.target.value }))}
                            className="h-10 rounded-xl"
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5 col-span-3 sm:col-span-1">
                            <Label htmlFor="appt-date" className="font-semibold text-sm">תאריך</Label>
                            <Input
                                id="appt-date"
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-3 sm:col-span-1">
                            <Label htmlFor="appt-time" className="font-semibold text-sm">שעת התחלה</Label>
                            <Input
                                id="appt-time"
                                type="time"
                                value={form.time}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="h-10 rounded-xl text-center"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-3 sm:col-span-1">
                            <Label htmlFor="appt-end-time" className="font-semibold text-sm">שעת סיום</Label>
                            <Input
                                id="appt-end-time"
                                type="time"
                                value={form.endTime}
                                onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                                className="h-10 rounded-xl text-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                        ביטול
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                        קבע תור
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
