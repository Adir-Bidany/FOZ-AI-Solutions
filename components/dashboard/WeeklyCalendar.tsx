"use client";

import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface WeeklyCalendarProps {
    events: any[] | null;
}

export default function WeeklyCalendar({ events }: WeeklyCalendarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const dateParam = searchParams.get("date");
    const currentDate = dateParam ? new Date(dateParam) : new Date();
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    
    // Start of week (Sunday)
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    
    const navigateDate = (newDate: Date) => {
        const dateStr = format(newDate, "yyyy-MM-dd");
        router.push(`?date=${dateStr}`);
    };

    const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const HOURS_START = 8;
    const HOURS_END = 20;
    const HOUR_HEIGHT = 70; // px per hour

    const hours = Array.from({ length: HOURS_END - HOURS_START + 1 }).map((_, i) => i + HOURS_START);

    const getEventStyle = (startTime?: string, endTime?: string) => {
        if (!startTime || !endTime) return { display: 'none' };
        
        const [sH, sM] = startTime.split(':').map(Number);
        const [eH, eM] = endTime.split(':').map(Number);

        const startTotalMinutes = (sH * 60) + sM;
        const endTotalMinutes = (eH * 60) + eM;
        const gridStartMinutes = HOURS_START * 60;

        let top = ((startTotalMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT;
        let height = ((endTotalMinutes - startTotalMinutes) / 60) * HOUR_HEIGHT;

        if (top < 0) {
            height += top;
            top = 0;
        }

        return {
            top: `${Math.max(0, top)}px`,
            height: `${Math.max(20, height)}px`,
        };
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigateDate(addWeeks(startDate, 1))}>
                        <ChevronRight size={18} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateDate(new Date())}>
                       מעבר בין שבועות
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateDate(subWeeks(startDate, 1))}>
                        <ChevronLeft size={18} />
                    </Button>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                    {format(startDate, "MMMM yyyy", { locale: he })}
                </h2>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-auto relative bg-slate-50/50">
                
                <div className="flex min-w-[800px] h-full transition-all">
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 bg-slate-50 border-l border-border/80 sticky right-0 z-30">
                        <div className="h-24 border-b border-border/80 bg-slate-100/80 sticky top-0 z-40"></div>
                        <div className="relative" style={{ height: `${(HOURS_END - HOURS_START) * HOUR_HEIGHT}px` }}>
                            {hours.slice(0, -1).map((h) => (
                                <div key={h} className="absolute w-full text-xs font-medium text-slate-400 text-center -mt-2" style={{ top: `${(h - HOURS_START) * HOUR_HEIGHT}px` }}>
                                    {h.toString().padStart(2, '0')}:00
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Days Columns */}
                    <div className="flex-1 flex relative">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 pointer-events-none">
                            {hours.slice(0, -1).map((h) => (
                                <div key={`grid-${h}`} className="border-b border-slate-100" style={{ height: `${HOUR_HEIGHT}px` }}></div>
                            ))}
                        </div>

                        {days.map((day, dayIdx) => (
                            <div key={dayIdx} className="flex-1 min-w-[120px] border-l border-slate-100 last:border-l-0 relative group">
                                {/* Day Header */}
                                <div className="h-24 border-b border-border/80 bg-white sticky top-0 z-40 flex flex-col items-center justify-center gap-1 group-hover:bg-blue-50/30 transition-colors">
                                    <span className="text-xs font-semibold uppercase text-slate-500">{format(day, "EEEE", { locale: he })}</span>
                                    <span className={`text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white shadow-md' : 'text-slate-800'}`}>
                                        {format(day, "d")}
                                    </span>
                                </div>

                                {/* Day Events */}
                                <div className="relative h-full" style={{ height: `${(HOURS_END - HOURS_START) * HOUR_HEIGHT}px` }}>
                                    {events?.filter(e => isSameDay(new Date(e.date), day)).map((event) => (
                                        <div
                                            key={event.id}
                                            className="absolute left-1 right-1 rounded-lg border shadow-sm flex flex-col p-2 text-sm overflow-hidden bg-white/95 border-emerald-200 cursor-pointer hover:shadow-md transition-shadow z-10 group/event"
                                            style={getEventStyle(event.startTime, event.endTime)}
                                            onClick={() => event.note ? setSelectedNote(event.note) : null}
                                        >
                                            <div className="flex items-start justify-between gap-1 mb-1">
                                                <span className="font-bold text-emerald-800 leading-tight truncate">{event.title}</span>
                                                <span className="text-[10px] font-medium text-emerald-600/80 whitespace-nowrap bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                                                    {event.startTime}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-600 truncate">{event.service}</span>
                                            {event.phone && (
                                                <span className="text-[11px] text-slate-400 mt-auto truncate" dir="ltr">{event.phone}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Note Popover Modal */}
            {selectedNote && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm" onClick={() => setSelectedNote(null)}>
                    <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-100" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-2 text-gray-900">הערות להזמנה</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedNote}</p>
                        <Button className="w-full mt-6" onClick={() => setSelectedNote(null)}>סגור</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
