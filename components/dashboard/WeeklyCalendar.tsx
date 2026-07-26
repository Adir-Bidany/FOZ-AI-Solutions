"use client";

import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import CalendarConnectModal from "./CalendarConnectModal";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface WeeklyCalendarProps {
    events: any[] | null;
    hasError?: boolean;
}

export default function WeeklyCalendar({ events, hasError = false }: WeeklyCalendarProps) {
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

    useEffect(() => {
        if (hasError) {
            toast.error("החיבור ליומן נכשל. אנא בדוק את הפרטים ונסה שנית");
        }
    }, [hasError]);

    const isUnconnected = events === null || hasError;

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
                {isUnconnected && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md">
                        <CalendarConnectModal hasError={hasError} />
                    </div>
                )}
                
                <div className={`flex min-w-[800px] h-full transition-all ${isUnconnected ? 'opacity-40 blur-[2px]' : ''}`}>
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
                    
                    {/* Day Columns */}
                    <div className="grid grid-cols-7 flex-1 divide-x divide-x-reverse divide-border/80">
                        {days.map((day, i) => {
                            const dayEvents = (events || []).filter(e => {
                                if (!e.date) return false;
                                const eDate = new Date(e.date);
                                return isSameDay(eDate, day);
                            });

                            return (
                                <div key={i} className="flex flex-col relative h-full bg-white">
                                    <div className="text-center h-24 border-b border-border/80 bg-slate-100/80 sticky top-0 z-20 flex flex-col justify-center">
                                        <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                                            {format(day, "EEEE", { locale: he })}
                                        </div>
                                        <div className={`text-2xl mt-1 ${isSameDay(day, new Date()) ? 'text-blue-600 font-black' : 'text-slate-900 font-bold'}`}>
                                            {format(day, "d")}
                                        </div>
                                    </div>
                                    <div className="relative flex-1" style={{ height: `${(HOURS_END - HOURS_START) * HOUR_HEIGHT}px` }}>
                                        {/* Grid lines */}
                                        {hours.slice(0, -1).map(h => (
                                            <div key={h} className="absolute w-full border-t border-slate-100" style={{ top: `${(h - HOURS_START) * HOUR_HEIGHT}px` }}></div>
                                        ))}
                                        
                                        {/* Event Cards */}
                                        {dayEvents.map((evt, idx) => {
                                            const style = getEventStyle(evt.startTime, evt.endTime);
                                            return (
                                                <div key={idx} className="absolute w-[92%] right-[4%] bg-blue-50/90 border border-blue-200 border-r-4 border-r-blue-500 rounded-md p-1.5 overflow-hidden shadow-sm hover:shadow-md hover:bg-blue-100 transition-all z-10" style={style}>
                                                    <div className="font-bold text-blue-900 text-xs truncate leading-tight">{evt.title}</div>
                                                    <div className="text-blue-700 text-[10px] mt-0.5 truncate">{evt.startTime?.substring(0,5)} - {evt.endTime?.substring(0,5)}</div>
                                                    {evt.service && <div className="text-blue-600/80 mt-0.5 text-[10px] truncate">{evt.service}</div>}
                                                    {evt.note && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setSelectedNote(evt.note); }}
                                                            className="mt-1 w-full bg-blue-200 text-blue-800 text-[10px] font-bold py-0.5 rounded shadow-sm hover:bg-blue-300 transition-colors"
                                                        >
                                                            הודעה מהלקוח
                                                        </button>
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
            </div>
            
            {/* Note Modal */}
            {selectedNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-sm overflow-hidden" dir="rtl">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">הודעה מהלקוח</h3>
                            <button onClick={() => setSelectedNote(null)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">
                                &times;
                            </button>
                        </div>
                        <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {selectedNote}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
