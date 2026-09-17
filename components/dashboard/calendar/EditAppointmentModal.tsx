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
import { Loader2, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export interface EditAppointmentModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    event?: any; // The selected CalendarEvent
}

export default function EditAppointmentModal({ open, onOpenChange, event }: EditAppointmentModalProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [form, setForm] = useState({
        customerName: "",
        customerPhone: "",
        service: "",
        date: "",
        time: "",
        endTime: "",
    });

    // Parse the notes field to extract name and phone (hacky but works based on our format)
    const extractNameAndPhone = (note?: string) => {
        let name = "";
        let phone = "";
        if (note) {
            const parts = note.split("|").map(s => s.trim());
            parts.forEach(p => {
                if (p.startsWith("שם:")) name = p.replace("שם:", "").trim();
                if (p.startsWith("טלפון:")) phone = p.replace("טלפון:", "").trim();
            });
        }
        return { name, phone };
    };

    useEffect(() => {
        if (open && event) {
            const { name, phone } = extractNameAndPhone(event.note);
            setForm({
                customerName: name,
                customerPhone: phone,
                service: event.service || "",
                date: event.date || "",
                time: (event.startTime || "").substring(0, 5),
                endTime: (event.endTime || "").substring(0, 5),
            });
        }
    }, [open, event]);

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

        if (!event?.id) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/calendar/appointments/${event.id}`, {
                method: "PATCH",
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
                toast.success("התור עודכן בהצלחה!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error("שגיאה בעדכון התור", { description: data.error });
            }
        } catch {
            toast.error("שגיאת תקשורת. אנא נסה שנית.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!event?.id) return;
        if (!confirm("האם אתה בטוח שברצונך למחוק תור זה?")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/calendar/appointments/${event.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                toast.success("התור נמחק בהצלחה!");
                onOpenChange(false);
                router.refresh();
            } else {
                toast.error("שגיאה במחיקת התור", { description: data.error });
            }
        } catch {
            toast.error("שגיאת תקשורת. אנא נסה שנית.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                <Edit3 size={18} />
                            </div>
                            <DialogTitle className="text-xl font-bold">עריכת תור</DialogTitle>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            onClick={handleDelete}
                            disabled={isDeleting || isSaving}
                            title="מחק תור"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-customer-name" className="font-semibold text-sm">שם הלקוח/ה</Label>
                            <Input
                                id="edit-customer-name"
                                value={form.customerName}
                                onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-customer-phone" className="font-semibold text-sm">טלפון</Label>
                            <Input
                                id="edit-customer-phone"
                                value={form.customerPhone}
                                onChange={(e) => setForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                                className="h-10 rounded-xl"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    {/* Service */}
                    <div className="space-y-1.5">
                        <Label htmlFor="edit-service-name" className="font-semibold text-sm">סוג שירות/טיפול</Label>
                        <Input
                            id="edit-service-name"
                            value={form.service}
                            onChange={(e) => setForm(prev => ({ ...prev, service: e.target.value }))}
                            className="h-10 rounded-xl"
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5 col-span-3 sm:col-span-1">
                            <Label htmlFor="edit-appt-date" className="font-semibold text-sm">תאריך</Label>
                            <Input
                                id="edit-appt-date"
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-3 sm:col-span-1">
                            <Label htmlFor="edit-appt-time" className="font-semibold text-sm">שעת התחלה</Label>
                            <Input
                                id="edit-appt-time"
                                type="time"
                                value={form.time}
                                onChange={(e) => handleTimeChange(e.target.value)}
                                className="h-10 rounded-xl text-center"
                            />
                        </div>
                        <div className="space-y-1.5 col-span-3 sm:col-span-1">
                            <Label htmlFor="edit-appt-end-time" className="font-semibold text-sm">שעת סיום</Label>
                            <Input
                                id="edit-appt-end-time"
                                type="time"
                                value={form.endTime}
                                onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                                className="h-10 rounded-xl text-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving || isDeleting}>
                        ביטול
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || isDeleting}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Edit3 className="w-4 h-4 ml-2" />}
                        שמור שינויים
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
