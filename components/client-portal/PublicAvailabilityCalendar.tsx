"use client";

import { useState, useEffect } from "react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { ChevronRight, ChevronLeft, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AvailabilityMap {
    [date: string]: {
        closedDay: boolean;
        takenHours: number[];
    };
}

interface PublicAvailabilityCalendarProps {
    businessId: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 - 21:00

export default function PublicAvailabilityCalendar({ businessId }: PublicAvailabilityCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availability, setAvailability] = useState<AvailabilityMap>({});
    const [isLoading, setIsLoading] = useState(false);

    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });

    useEffect(() => {
        setIsLoading(true);
        const weekStartStr = format(startDate, "yyyy-MM-dd");
        fetch(`/api/calendar/public-availability?businessId=${businessId}&weekStart=${weekStartStr}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setAvailability(data.availability);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [businessId, startDate]);

    const handleSlotClick = (date: Date, hour: number) => {
        const dayName = format(date, "EEEE", { locale: he });
        const timeStr = `${hour.toString().padStart(2, "0")}:00`;
        const msg = `היי דניאלה, אני רוצה לקבוע תור ליום ${dayName} בשעה ${timeStr}`;
        window.dispatchEvent(new CustomEvent("open-daniela", { detail: { message: msg } }));
    };

    return (
        <Card className="flex flex-col bg-card rounded-2xl shadow-sm border border-border overflow-hidden" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center p-3 sm:p-4 border-b border-border bg-muted/20">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
                        <ChevronRight size={16} />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-full" onClick={() => setCurrentDate(new Date())}>
                        היום
                    </Button>
                    <Button variant="outline" size="icon" className="w-8 h-8 rounded-full" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
                        <ChevronLeft size={16} />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                        {format(startDate, "MMMM yyyy", { locale: he })}
                    </h2>
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-x-auto relative">
                <div className="flex min-w-[600px] h-full relative">
                    
                    {/* Time Gutter */}
                    <div className="w-14 sm:w-16 shrink-0 bg-muted/10 border-l border-border sticky right-0 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="h-14 border-b border-border sticky top-0 z-40 bg-muted/10" />
                        {HOURS.map((hour) => (
                            <div key={hour} className="h-12 border-b border-border flex items-center justify-center relative">
                                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground -translate-y-1/2 absolute top-0 bg-muted/10 px-1">
                                    {hour.toString().padStart(2, "0")}:00
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const date = addDays(startDate, i);
                        const dateKey = format(date, "yyyy-MM-dd");
                        const dayData = availability[dateKey] || { closedDay: false, takenHours: [] };
                        const isToday = isSameDay(date, new Date());
                        const isPastDay = date.getTime() < new Date().setHours(0,0,0,0);

                        return (
                            <div key={i} className="flex-1 flex flex-col min-w-[70px] border-l border-border/50 last:border-l-0 relative group">
                                {/* Day Header */}
                                <div className={cn(
                                    "h-14 flex flex-col items-center justify-center border-b border-border sticky top-0 z-20 bg-card transition-colors",
                                    isToday && "bg-primary/5"
                                )}>
                                    <span className={cn("text-xs font-medium mb-0.5", isToday ? "text-primary" : "text-muted-foreground")}>
                                        {format(date, "EEEEEE", { locale: he })}
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full",
                                        isToday ? "bg-primary text-primary-foreground" : "text-foreground group-hover:bg-muted"
                                    )}>
                                        {format(date, "d")}
                                    </span>
                                </div>

                                {/* Day Slots */}
                                <div className={cn("flex-1 flex flex-col", (dayData.closedDay || isPastDay) && "bg-muted/30")}>
                                    {HOURS.map((hour) => {
                                        const isPastSlot = isToday && hour <= new Date().getHours();
                                        const isClosed = dayData.closedDay || isPastDay || isPastSlot;
                                        const isTaken = dayData.takenHours.includes(hour);
                                        const isUnavailable = isClosed || isTaken;

                                        return (
                                            <div 
                                                key={hour} 
                                                className={cn(
                                                    "h-12 border-b border-border/50 transition-all flex items-center justify-center group/slot relative",
                                                    isUnavailable 
                                                        ? "bg-muted/50 cursor-not-allowed" 
                                                        : "cursor-pointer hover:bg-primary/10"
                                                )}
                                                onClick={() => !isUnavailable && handleSlotClick(date, hour)}
                                            >
                                                {!isUnavailable && (
                                                    <span className="opacity-0 group-hover/slot:opacity-100 text-[10px] font-bold text-primary transition-opacity">
                                                        קבע תור
                                                    </span>
                                                )}
                                                {isTaken && !isClosed && (
                                                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 5px,currentColor 5px,currentColor 10px)" }}></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
