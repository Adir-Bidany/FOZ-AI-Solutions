"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Appointment {
    id: string;
    service_name: string;
    date: string;
    startTime: string;
    duration_minutes: number;
    status: string;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    completed:  { label: "הושלם",  variant: "default" },
    confirmed:  { label: "אושר",   variant: "secondary" },
    cancelled:  { label: "בוטל",   variant: "destructive" },
    no_show:    { label: "לא הגיע", variant: "outline" },
};

function dispatchDaniela(message: string) {
    window.dispatchEvent(new CustomEvent("open-daniela", { detail: { message } }));
}

export default function PastTreatmentsList() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading]       = useState(true);

    useEffect(() => {
        fetch("/api/customer/appointments?type=past&limit=3")
            .then(res => res.json())
            .then(data => {
                if (data.success) setAppointments(data.appointments || []);
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <Card className="p-5 flex items-center justify-center h-24 border border-border rounded-2xl" dir="rtl">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    if (appointments.length === 0) {
        return (
            <Card className="p-5 border border-dashed border-border rounded-2xl bg-card/60" dir="rtl">
                <div className="flex flex-col items-center gap-2 text-center py-2">
                    <History className="w-7 h-7 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">אין טיפולים קודמים</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border border-border rounded-2xl overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold text-foreground">טיפולים קודמים</h3>
            </div>

            {/* List */}
            <ul className="divide-y divide-border">
                {appointments.map(appt => {
                    const displayDate = new Date(`${appt.date}T${appt.startTime}`).toLocaleDateString("he-IL", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    });
                    const statusInfo = STATUS_LABELS[appt.status] ?? { label: appt.status, variant: "outline" as const };

                    return (
                        <li key={appt.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                            {/* Left: details */}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground truncate">{appt.service_name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{displayDate} · {appt.startTime}</p>
                            </div>

                            {/* Center: status badge */}
                            <Badge variant={statusInfo.variant} className="shrink-0 text-[11px]">
                                {statusInfo.label}
                            </Badge>

                            {/* Right: book again */}
                            {appt.status !== "cancelled" && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0 rounded-xl text-xs h-8 px-3 border-primary/30 text-primary hover:bg-primary/5"
                                    onClick={() =>
                                        dispatchDaniela(`אני רוצה לקבוע שוב תור ל${appt.service_name}`)
                                    }
                                >
                                    <RotateCcw className="w-3 h-3 ml-1" />
                                    קבע שוב
                                </Button>
                            )}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
