"use client";

import React, { useEffect, useState } from "react";
import { Clock, CalendarDays, TrendingUp, Users, ArrowUp, ArrowDown, Minus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricCard {
    id: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    label: string;
    labelEn: string;
    value: string;
    subValue?: string;
    trend: "up" | "down" | "neutral";
    trendLabel: string;
    trendColor: string;
    accentFrom: string;
    accentTo: string;
}

// ─── Mock metric data ─────────────────────────────────────────────────────────

const MOCK_METRICS: MetricCard[] = [
    {
        id: "ai-time-saved",
        icon: Clock,
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-500",
        label: "זמן שחסך ה-AI",
        labelEn: "AI Time Saved",
        value: "7 שעות",
        subValue: "השבוע הנוכחי",
        trend: "up",
        trendLabel: "+2.5 שע׳ לעומת שבוע שעבר",
        trendColor: "text-emerald-500",
        accentFrom: "from-violet-500/10",
        accentTo: "to-transparent",
    },
    {
        id: "daily-appointments",
        icon: CalendarDays,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
        label: "תורים להיום",
        labelEn: "Daily Appointments",
        value: "6 תורים",
        subValue: "1 ממתין לאישור",
        trend: "up",
        trendLabel: "+1 מאתמול",
        trendColor: "text-emerald-500",
        accentFrom: "from-blue-500/10",
        accentTo: "to-transparent",
    },
    {
        id: "marketing-health",
        icon: TrendingUp,
        iconBg: "bg-fuchsia-500/10",
        iconColor: "text-fuchsia-500",
        label: "בריאות שיווקית",
        labelEn: "Marketing Health",
        value: "3 פוסטים",
        subValue: "השבוע — קצב טוב 🟢",
        trend: "neutral",
        trendLabel: "תדירות פרסום תקינה",
        trendColor: "text-muted-foreground",
        accentFrom: "from-fuchsia-500/10",
        accentTo: "to-transparent",
    },
    {
        id: "leads",
        icon: Users,
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
        label: "לידים החודש",
        labelEn: "Monthly Leads",
        value: "12 לידים",
        subValue: "4 הומרו ללקוחות",
        trend: "up",
        trendLabel: "+33% לעומת חודש שעבר",
        trendColor: "text-emerald-500",
        accentFrom: "from-amber-500/10",
        accentTo: "to-transparent",
    },
];

const CLEAN_METRICS: MetricCard[] = [
    {
        id: "ai-time-saved",
        icon: Clock,
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-500",
        label: "זמן שחסך ה-AI",
        labelEn: "AI Time Saved",
        value: "0 שעות",
        subValue: "השבוע הנוכחי",
        trend: "neutral",
        trendLabel: "ממתין לפעילות ראשונה",
        trendColor: "text-muted-foreground",
        accentFrom: "from-violet-500/10",
        accentTo: "to-transparent",
    },
    {
        id: "daily-appointments",
        icon: CalendarDays,
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
        label: "תורים להיום",
        labelEn: "Daily Appointments",
        value: "0 תורים",
        subValue: "0 ממתינים לאישור",
        trend: "neutral",
        trendLabel: "אין תורים לביצוע להיום",
        trendColor: "text-muted-foreground",
        accentFrom: "from-blue-500/10",
        accentTo: "to-transparent",
    },
    {
        id: "marketing-health",
        icon: TrendingUp,
        iconBg: "bg-fuchsia-500/10",
        iconColor: "text-fuchsia-500",
        label: "בריאות שיווקית",
        labelEn: "Marketing Health",
        value: "0 פוסטים",
        subValue: "ממתין לתוכן ראשון",
        trend: "neutral",
        trendLabel: "מוכן ליצירת תוכן",
        trendColor: "text-muted-foreground",
        accentFrom: "from-fuchsia-500/10",
        accentTo: "to-transparent",
    },
    {
        id: "leads",
        icon: Users,
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
        label: "לידים החודש",
        labelEn: "Monthly Leads",
        value: "0 לידים",
        subValue: "0 הומרו ללקוחות",
        trend: "neutral",
        trendLabel: "ממתין לפניות מהצ'אט",
        trendColor: "text-muted-foreground",
        accentFrom: "from-amber-500/10",
        accentTo: "to-transparent",
    },
];

const TREND_ICON: Record<MetricCard["trend"], React.ElementType> = {
    up: ArrowUp,
    down: ArrowDown,
    neutral: Minus,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroMetrics() {
    const [visible, setVisible] = useState(false);
    const isDemoMode = typeof window !== "undefined" && window.location.search.includes("demo=true");
    const metricsList = isDemoMode ? MOCK_METRICS : CLEAN_METRICS;

    // Staggered entrance animation
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <section id="v2-hero-metrics" aria-label="מדדים מרכזיים">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">

                <div>
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-none">
                        מדדים מרכזיים
                    </h2>
                  
                </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricsList.map((metric, i) => {
                    const Icon = metric.icon;
                    const TrendIcon = TREND_ICON[metric.trend];

                    return (
                        <div
                            key={metric.id}
                            id={`metric-card-${metric.id}`}
                            className={`
                                group relative bg-card border border-border rounded-2xl p-5 shadow-sm
                                hover:shadow-lg hover:-translate-y-0.5
                                transition-all duration-300 overflow-hidden
                                ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
                            `}
                            style={{ transitionDelay: `${i * 75}ms` }}
                        >
                            {/* Subtle background accent */}
                            <div
                                className={`absolute bottom-0 start-0 w-full h-24 bg-gradient-to-t ${metric.accentFrom} ${metric.accentTo} opacity-60 pointer-events-none`}
                            />

                            {/* Icon + Badge row */}
                            <div className="flex items-start justify-between mb-4 relative">
                                <div className={`w-10 h-10 rounded-xl ${metric.iconBg} border border-border/60 flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-semibold ${metric.trendColor} bg-current/5 px-2 py-0.5 rounded-full`}>
                                    <TrendIcon className="w-3 h-3" />
                                </div>
                            </div>

                            {/* Label */}
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 relative">
                                {metric.label}
                            </p>

                            {/* Main value */}
                            <h3 className="text-2xl font-extrabold text-foreground tracking-tight leading-none mb-1.5 relative">
                                {metric.value}
                            </h3>

                            {/* Sub value */}
                            {metric.subValue && (
                                <p className="text-xs text-muted-foreground font-medium relative mb-2">
                                    {metric.subValue}
                                </p>
                            )}

                            {/* Trend line */}
                            <div className={`flex items-center gap-1 text-[11px] font-semibold ${metric.trendColor} relative`}>
                                <TrendIcon className="w-3 h-3 shrink-0" />
                                <span>{metric.trendLabel}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
