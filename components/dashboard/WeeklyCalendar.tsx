"use client";

import { format, addDays, startOfWeek, subWeeks, addWeeks, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { ChevronRight, ChevronLeft, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface WorkingHourEntry {
    day: number;      // 0=Sun … 6=Sat
    isOpen: boolean;
    startTime: string; // "HH:MM"
    endTime: string;   // "HH:MM"
}

interface CalendarEvent {
    id: string;
    type?: "booking" | "block";
    title: string;
    date: string;       // "YYYY-MM-DD"
    startTime: string;  // "HH:MM:SS"
    endTime: string;    // "HH:MM:SS"
    service?: string;
    phone?: string;
    note?: string;
    isFullDay?: boolean;
}

interface WeeklyCalendarProps {
    events: CalendarEvent[] | null;
    workingHours?: WorkingHourEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const HOURS_START = 8;
const HOURS_END = 20;
const HOUR_HEIGHT = 70; // px per hour

/** Convert "HH:MM" or "HH:MM:SS" to total minutes since midnight */
function toMinutes(time: string): number {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}

function getEventPositionStyle(startTime: string, endTime: string): React.CSSProperties {
    const startMin = toMinutes(startTime);
    const endMin   = toMinutes(endTime);
    const gridStartMin = HOURS_START * 60;

    let top    = ((startMin - gridStartMin) / 60) * HOUR_HEIGHT;
    let height = ((endMin - startMin) / 60) * HOUR_HEIGHT;

    if (top < 0) { height += top; top = 0; }

    return {
        top:    `${Math.max(0, top)}px`,
        height: `${Math.max(20, height)}px`,
    };
}

/**
 * Returns true if the given hour slot (e.g. 9 = 09:00–10:00) falls OUTSIDE
 * the business working hours for the given day-of-week.
 */
function isHourClosed(hour: number, dayOfWeek: number, workingHours?: WorkingHourEntry[]): boolean {
    if (!workingHours) return false;
    const dayConfig = workingHours.find(w => w.day === dayOfWeek);
    if (!dayConfig) return false;
    if (!dayConfig.isOpen) return true;

    const slotStart = hour * 60;
    const slotEnd   = slotStart + 60;
    const openStart = toMinutes(dayConfig.startTime);
    const openEnd   = toMinutes(dayConfig.endTime);

    // Slot is outside the open window
    return slotEnd <= openStart || slotStart >= openEnd;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function WeeklyCalendar({ events, workingHours }: WeeklyCalendarProps) {
    const router       = useRouter();
    const searchParams = useSearchParams();

    const dateParam   = searchParams.get("date");
    const currentDate = dateParam ? new Date(dateParam) : new Date();
    const startDate   = startOfWeek(currentDate, { weekStartsOn: 0 });

    const [selectedNote, setSelectedNote] = useState<string | null>(null);

    const navigateDate = (newDate: Date) => {
        router.push(`?date=${format(newDate, "yyyy-MM-dd")}`);
    };

    const days  = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    const hours = Array.from({ length: HOURS_END - HOURS_START }).map((_, i) => i + HOURS_START);

    return (
        <div
            className="flex flex-col h-[calc(100vh-14rem)] min-h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative"
            dir="rtl"
        >
            {/* ── Header ────────────────────────────────────────────────── */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => navigateDate(addWeeks(startDate, 1))}>
                        <ChevronRight size={18} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateDate(new Date())}>
                        היום
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => navigateDate(subWeeks(startDate, 1))}>
                        <ChevronLeft size={18} />
                    </Button>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                    {format(startDate, "MMMM yyyy", { locale: he })}
                </h2>
            </div>

            {/* ── Scrollable Grid ───────────────────────────────────────── */}
            <div className="flex-1 overflow-auto">
                <div className="flex min-w-[700px]">

                    {/* Time Gutter */}
                    <div className="w-14 shrink-0 bg-slate-50 border-l border-slate-100 sticky right-0 z-30">
                        {/* Spacer to align with day headers */}
                        <div className="h-20 border-b border-slate-200 bg-slate-100/80 sticky top-0 z-40" />
                        <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
                            {hours.map(h => (
                                <div
                                    key={h}
                                    className="absolute w-full text-[11px] font-medium text-slate-400 text-center"
                                    style={{ top: `${(h - HOURS_START) * HOUR_HEIGHT - 6}px` }}
                                >
                                    {h.toString().padStart(2, "0")}:00
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Day Columns */}
                    <div className="flex-1 flex">
                        {days.map((day, dayIdx) => {
                            const dowIndex = day.getDay(); // 0=Sun…6=Sat
                            const dayConfig = workingHours?.find(w => w.day === dowIndex);
                            const isDayClosed = dayConfig ? !dayConfig.isOpen : false;

                            return (
                                <div
                                    key={dayIdx}
                                    className="flex-1 min-w-[100px] border-l border-slate-100 last:border-l-0 relative"
                                >
                                    {/* Day Header */}
                                    <div
                                        className={`h-20 border-b border-slate-200 sticky top-0 z-40 flex flex-col items-center justify-center gap-0.5
                                            ${isDayClosed ? "bg-slate-100" : "bg-white"}`}
                                    >
                                        <span className="text-[11px] font-semibold uppercase text-slate-500">
                                            {format(day, "EEEE", { locale: he })}
                                        </span>
                                        <span
                                            className={`text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-full
                                                ${isSameDay(day, new Date())
                                                    ? "bg-blue-600 text-white shadow-md"
                                                    : isDayClosed
                                                    ? "text-slate-400"
                                                    : "text-slate-800"}`}
                                        >
                                            {format(day, "d")}
                                        </span>
                                        {isDayClosed && (
                                            <span className="text-[10px] text-slate-400 font-medium">סגור</span>
                                        )}
                                    </div>

                                    {/* Hour Rows */}
                                    <div
                                        className="relative"
                                        style={{ height: `${hours.length * HOUR_HEIGHT}px` }}
                                    >
                                        {/* Hour background rows (closed = gray) */}
                                        {hours.map(h => {
                                            const closed = isDayClosed || isHourClosed(h, dowIndex, workingHours);
                                            return (
                                                <div
                                                    key={h}
                                                    className={`absolute w-full border-b border-slate-100
                                                        ${closed
                                                            ? "bg-slate-100/70"
                                                            : "bg-transparent"
                                                        }`}
                                                    style={{
                                                        top:    `${(h - HOURS_START) * HOUR_HEIGHT}px`,
                                                        height: `${HOUR_HEIGHT}px`,
                                                    }}
                                                />
                                            );
                                        })}

                                        {/* Events & Blocks */}
                                        {events
                                            ?.filter(e => isSameDay(new Date(e.date), day))
                                            .map(event => {
                                                const isBlock = event.type === "block";

                                                if (isBlock && event.isFullDay) {
                                                    // Full-day block: cover the entire column
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            className="absolute inset-x-1 top-0 bottom-0 rounded-lg z-10
                                                                bg-slate-200/80 border border-slate-300
                                                                flex items-center justify-center text-center p-2"
                                                            style={{ backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(0,0,0,0.04) 6px,rgba(0,0,0,0.04) 12px)" }}
                                                        >
                                                            <div>
                                                                <Ban size={14} className="mx-auto mb-1 text-slate-500" />
                                                                <p className="text-xs font-semibold text-slate-600 leading-tight">{event.title}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`absolute left-1 right-1 rounded-lg border shadow-sm
                                                            flex flex-col p-1.5 text-sm overflow-hidden cursor-pointer
                                                            hover:shadow-md transition-shadow z-10
                                                            ${isBlock
                                                                ? "bg-slate-100 border-slate-300 text-slate-600"
                                                                : "bg-white/95 border-emerald-200"
                                                            }`}
                                                        style={{
                                                            ...getEventPositionStyle(event.startTime, event.endTime),
                                                            ...(isBlock
                                                                ? { backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 5px,rgba(0,0,0,0.04) 5px,rgba(0,0,0,0.04) 10px)" }
                                                                : {}),
                                                        }}
                                                        onClick={() => event.note ? setSelectedNote(event.note) : null}
                                                    >
                                                        <div className="flex items-start justify-between gap-1">
                                                            {isBlock
                                                                ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <Ban size={10} className="text-slate-400 shrink-0" />
                                                                        <span className="font-semibold text-xs text-slate-600 truncate">{event.title}</span>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <span className="font-bold text-emerald-800 leading-tight truncate text-xs">{event.title}</span>
                                                                        <span className="text-[10px] font-medium text-emerald-600/80 whitespace-nowrap bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                                                                            {event.startTime.substring(0, 5)}
                                                                        </span>
                                                                    </>
                                                                )
                                                            }
                                                        </div>
                                                        {!isBlock && event.service && (
                                                            <span className="text-[11px] text-slate-500 truncate mt-0.5">{event.service}</span>
                                                        )}
                                                        {!isBlock && event.phone && (
                                                            <span className="text-[10px] text-slate-400 mt-auto truncate" dir="ltr">{event.phone}</span>
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

            {/* ── Note Modal ────────────────────────────────────────────── */}
            {selectedNote && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                    onClick={() => setSelectedNote(null)}
                >
                    <div
                        className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full mx-4 border border-gray-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="font-bold text-lg mb-2 text-gray-900">הערות להזמנה</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{selectedNote}</p>
                        <Button className="w-full mt-6" onClick={() => setSelectedNote(null)}>סגור</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
