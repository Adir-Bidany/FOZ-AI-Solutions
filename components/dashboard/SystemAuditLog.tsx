"use client";

import React, { useRef } from "react";
import {
    ImageIcon,
    CalendarDays,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    BarChart2,
    UploadCloud,
    RefreshCw,
    Bot,
    Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LogCategory = "backup" | "sync" | "message" | "analytics" | "security" | "publish";

interface AuditEntry {
    id: string;
    category: LogCategory;
    message: string;
    detail?: string;
    timestamp: string;
    agent: string;
    success: boolean;
}

// ─── Mock audit log data ──────────────────────────────────────────────────────

const AUDIT_LOG: AuditEntry[] = [
    {
        id: "log-1",
        category: "backup",
        message: "גיבוי 4 תמונות שיווקיות הושלם",
        detail: "4 קבצים • 12.3 MB",
        timestamp: "12:14",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-2",
        category: "sync",
        message: "סנכרון יומן Google Calendar",
        detail: "6 אירועים עודכנו",
        timestamp: "12:01",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-3",
        category: "message",
        message: "נשלחו 3 תזכורות תור אוטומטיות",
        detail: "WhatsApp Business API",
        timestamp: "11:45",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-4",
        category: "analytics",
        message: "עדכון דוח ביצועי פוסטים",
        detail: "Facebook + Instagram",
        timestamp: "11:30",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-5",
        category: "publish",
        message: "פוסט שיווקי פורסם אוטומטית",
        detail: "Instagram • 487 צפיות",
        timestamp: "10:00",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-6",
        category: "security",
        message: "בדיקת אבטחת חשבון Meta",
        detail: "אין חריגות שזוהו",
        timestamp: "09:15",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-7",
        category: "sync",
        message: "נסיון סנכרון SimplyBook נכשל",
        detail: "פג תוקף הטוקן — נדרש חיבור מחדש",
        timestamp: "09:00",
        agent: "גולדה",
        success: false,
    },
    {
        id: "log-8",
        category: "backup",
        message: "גיבוי בסיס נתונים לקוחות",
        detail: "127 רשומות • הושלם בהצלחה",
        timestamp: "08:30",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-9",
        category: "message",
        message: "הודעת ברוך הבא נשלחה ל-2 לקוחות חדשים",
        detail: "WhatsApp • תגובה ממתינה",
        timestamp: "08:15",
        agent: "גולדה",
        success: true,
    },
    {
        id: "log-10",
        category: "analytics",
        message: "סיכום יומי הופק ונשמר",
        detail: "PDF • 3 עמודים",
        timestamp: "08:00",
        agent: "גולדה",
        success: true,
    },
];

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
    LogCategory,
    { icon: React.ElementType; dotColor: string; iconColor: string; iconBg: string }
> = {
    backup:    { icon: UploadCloud,    dotColor: "bg-violet-500",  iconColor: "text-violet-500",  iconBg: "bg-violet-500/10"  },
    sync:      { icon: RefreshCw,      dotColor: "bg-blue-500",    iconColor: "text-blue-500",    iconBg: "bg-blue-500/10"    },
    message:   { icon: MessageSquare,  dotColor: "bg-emerald-500", iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
    analytics: { icon: BarChart2,      dotColor: "bg-cyan-500",    iconColor: "text-cyan-500",    iconBg: "bg-cyan-500/10"    },
    security:  { icon: ShieldCheck,    dotColor: "bg-amber-500",   iconColor: "text-amber-500",   iconBg: "bg-amber-500/10"   },
    publish:   { icon: UploadCloud,    dotColor: "bg-fuchsia-500", iconColor: "text-fuchsia-500", iconBg: "bg-fuchsia-500/10" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SystemAuditLog() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const successCount = AUDIT_LOG.filter((l) => l.success).length;
    const failCount = AUDIT_LOG.length - successCount;

    return (
        <section id="v2-audit-log" aria-label="יומן פעילות מערכת">

            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-none">
                            פעילות רקע
                        </h2>
                    
                    </div>
                </div>
            </div>

            {/* Scrollable log container */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">


                {/* Scrollable entries */}
                <div
                    ref={scrollRef}
                    className="h-72 overflow-y-auto custom-scrollbar divide-y divide-border/40"
                >
                    {AUDIT_LOG.map((entry, idx) => {
                        const catConf = CATEGORY_CONFIG[entry.category];
                        const CatIcon = catConf.icon;

                        return (
                            <div
                                key={entry.id}
                                id={`audit-${entry.id}`}
                                className={`
                                    flex items-start gap-3 px-4 py-3
                                    hover:bg-muted/30 transition-colors duration-150
                                    ${!entry.success ? "bg-red-500/5" : ""}
                                `}
                            >
                                {/* Timeline dot + icon */}
                                <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                                    <div className={`w-7 h-7 rounded-lg ${catConf.iconBg} flex items-center justify-center`}>
                                        <CatIcon className={`w-3.5 h-3.5 ${catConf.iconColor}`} />
                                    </div>
                                    {idx < AUDIT_LOG.length - 1 && (
                                        <div className="w-px h-3 bg-border/60" />
                                    )}
                                </div>

                                {/* Entry content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-start justify-between gap-2">
                                        <span className={`text-sm font-semibold leading-snug ${
                                            entry.success ? "text-foreground" : "text-red-600 dark:text-red-400"
                                        }`}>
                                            {entry.message}
                                        </span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {/* Status dot */}
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.success ? "bg-emerald-500" : "bg-red-500"}`} />
                                            {/* Timestamp */}
                                            <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                                                {entry.timestamp}
                                            </span>
                                        </div>
                                    </div>

                                    {entry.detail && (
                                        <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                            {entry.detail}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>כל הפעולות בוצעו אוטומטית ע״י גולדה</span>
                    </div>
                    <button
                        id="audit-log-refresh"
                        className="text-[11px] font-semibold text-primary hover:underline"
                        onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        חזור לתחילת הרשימה
                    </button>
                </div>
            </div>
        </section>
    );
}
