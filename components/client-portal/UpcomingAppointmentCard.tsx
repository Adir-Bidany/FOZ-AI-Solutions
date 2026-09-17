"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, XCircle, PlusCircle, Loader2 } from "lucide-react";

interface Appointment {
    id: string;
    service_name: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

function getCountdown(dateStr: string, startTime: string): string {
    const target = new Date(`${dateStr}T${startTime}`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return "עכשיו!";

    const totalMinutes = Math.floor(diffMs / 60000);
    const days    = Math.floor(totalMinutes / 1440);
    const hours   = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0)    parts.push(`${days} יום`);
    if (hours > 0)   parts.push(`${hours} שעות`);
    if (minutes > 0) parts.push(`${minutes} דקות`);

    return parts.length > 0 ? `בעוד ${parts.join(" ו-")}` : "בקרוב";
}

function dispatchDaniela(message: string) {
    window.dispatchEvent(new CustomEvent("open-daniela", { detail: { message } }));
}

export default function UpcomingAppointmentCard() {
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [isLoading, setIsLoading]     = useState(true);
    const [countdown, setCountdown]     = useState("");

    useEffect(() => {
        fetch("/api/customer/appointments?type=upcoming&limit=1")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.appointments?.length > 0) {
                    setAppointment(data.appointments[0]);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    // Live countdown — updates every minute
    const updateCountdown = useCallback(() => {
        if (appointment) {
            setCountdown(getCountdown(appointment.date, appointment.startTime));
        }
    }, [appointment]);

    useEffect(() => {
        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [updateCountdown]);

    if (isLoading) {
        return (
            <Card className="p-5 flex items-center justify-center h-28 border border-border rounded-2xl" dir="rtl">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    if (!appointment) {
        return (
            <Card className="p-5 border border-dashed border-border rounded-2xl bg-card/60" dir="rtl">
                <div className="flex flex-col items-center gap-3 text-center py-2">
                    <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground font-medium">אין תורים קרובים</p>
                    <Button
                        size="sm"
                        className="rounded-xl mt-1"
                        onClick={() => dispatchDaniela("היי דניאלה, אני רוצה לקבוע תור")}
                    >
                        <PlusCircle className="w-4 h-4 ml-1.5" />
                        קבע תור ראשון
                    </Button>
                </div>
            </Card>
        );
    }

    // Format display date
    const displayDate = new Date(`${appointment.date}T${appointment.startTime}`).toLocaleDateString("he-IL", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <Card className="p-5 border border-primary/20 bg-primary/5 rounded-2xl space-y-4" dir="rtl">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">התור הקרוב שלך</p>
                    <h3 className="text-lg font-bold text-foreground">{appointment.service_name}</h3>
                </div>
                {/* Countdown badge */}
                <div className="shrink-0 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold whitespace-nowrap">
                    {countdown}
                </div>
            </div>

            {/* Details row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-primary/70" />
                    <span>{displayDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary/70" />
                    <span>{appointment.startTime} – {appointment.endTime}</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    onClick={() => dispatchDaniela("אני רוצה לבטל או לשנות את התור הקרוב שלי")}
                >
                    <XCircle className="w-3.5 h-3.5 ml-1.5" />
                    ביטול / שינוי
                </Button>
                <Button
                    size="sm"
                    className="flex-1 rounded-xl"
                    onClick={() => dispatchDaniela("אני רוצה לקבוע תור נוסף")}
                >
                    <PlusCircle className="w-3.5 h-3.5 ml-1.5" />
                    קבע תור נוסף
                </Button>
            </div>
        </Card>
    );
}
