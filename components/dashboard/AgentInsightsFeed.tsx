"use client";

import React, { useState } from "react";
import {
    Lightbulb,
    CalendarPlus,
    Megaphone,
    UserPlus,
    BarChart2,
    ChevronRight,
    X,
    Sparkles,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type InsightType = "opportunity" | "alert" | "suggestion" | "analytics";

interface AgentInsight {
    id: string;
    type: InsightType;
    agent: string;
    title: string;
    body: string;
    timestamp: string;
    actions?: InsightAction[];
    isNew?: boolean;
}

interface InsightAction {
    id: string;
    label: string;
    icon: React.ElementType;
    variant: "primary" | "ghost";
    href?: string;
}

// ─── Mock insight data ────────────────────────────────────────────────────────

const MOCK_INSIGHTS: AgentInsight[] = [
    {
        id: "insight-1",
        type: "opportunity",
        agent: "גולדה",
        title: "זיהיתי 3 חלונות פנויים מחר בבוקר",
        body: "יש לך 3 פגישות ריקות בין 9:00 ל-12:00. זה זמן מצוין להפיץ קמפיין בזק ולמלא אותן עם לקוחות שביקשו להיות בתור המתנה.",
        timestamp: "לפני 5 דקות",
        isNew: true,
        actions: [
            { id: "create-campaign", label: "צור קמפיין בזק", icon: Megaphone, variant: "primary" },
            { id: "view-calendar", label: "צפה ביומן", icon: CalendarPlus, variant: "ghost" },
        ],
    },
    {
        id: "insight-2",
        type: "alert",
        agent: "גולדה",
        title: "4 לקוחות לא ענו לתזכורת תור",
        body: "גולדה שלחה תזכורות ל-4 לקוחות עם תור מחר, ו-4 מהם עדיין לא אישרו. שקול להעביר אותם לרשימת המתנה.",
        timestamp: "לפני 18 דקות",
        isNew: true,
        actions: [
            { id: "send-reminder", label: "שלח תזכורת נוספת", icon: Megaphone, variant: "primary" },
            { id: "add-waitlist", label: "הוסף לרשימת המתנה", icon: UserPlus, variant: "ghost" },
        ],
    },
    {
        id: "insight-3",
        type: "suggestion",
        agent: "גולדה",
        title: "הזדמנות לפוסט שיווקי — יום שישי אחה\"צ",
        body: "בהתבסס על נתוני המעורבות שלך, יום שישי בין 14:00-16:00 הוא הזמן הטוב ביותר לפרסם. לא פורסם כלום עדיין השבוע.",
        timestamp: "לפני 1 שעה",
        actions: [
            { id: "draft-post", label: "כתוב פוסט עם גולדה", icon: Sparkles, variant: "primary" },
        ],
    },
    {
        id: "insight-4",
        type: "analytics",
        agent: "גולדה",
        title: "ביצועי WhatsApp — עלייה של 23% בפתיחות",
        body: "בשבוע האחרון, שיעור פתיחת ההודעות בוואטסאפ עלה ב-23%. ההודעות הקצרות והאישיות עובדות הכי טוב.",
        timestamp: "לפני 3 שעות",
        actions: [
            { id: "view-analytics", label: "צפה בדוח מלא", icon: BarChart2, variant: "ghost" },
        ],
    },
];

// ─── Type styling ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
    InsightType,
    { border: string; iconBg: string; iconColor: string; icon: React.ElementType; badgeBg: string; badgeText: string }
> = {
    opportunity: {
        border: "border-r-emerald-500",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
        icon: Lightbulb,
        badgeBg: "bg-emerald-500/10 border-emerald-500/20",
        badgeText: "text-emerald-600 dark:text-emerald-400",
    },
    alert: {
        border: "border-r-amber-500",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
        icon: Megaphone,
        badgeBg: "bg-amber-500/10 border-amber-500/20",
        badgeText: "text-amber-600 dark:text-amber-400",
    },
    suggestion: {
        border: "border-r-purple-500",
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-500",
        icon: Sparkles,
        badgeBg: "bg-purple-500/10 border-purple-500/20",
        badgeText: "text-purple-600 dark:text-purple-400",
    },
    analytics: {
        border: "border-r-cyan-500",
        iconBg: "bg-cyan-500/10",
        iconColor: "text-cyan-500",
        icon: BarChart2,
        badgeBg: "bg-cyan-500/10 border-cyan-500/20",
        badgeText: "text-cyan-600 dark:text-cyan-400",
    },
};

const TYPE_LABEL: Record<InsightType, string> = {
    opportunity: "הזדמנות",
    alert: "התראה",
    suggestion: "הצעה",
    analytics: "ניתוח",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AgentInsightsFeed() {
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState<string | null>(MOCK_INSIGHTS[0]?.id ?? null);

    const visible = MOCK_INSIGHTS.filter((i) => !dismissed.has(i.id));
    const newCount = visible.filter((i) => i.isNew).length;

    const dismiss = (id: string) => setDismissed((prev) => new Set([...prev, id]));

    return (
        <section id="v2-agent-insights" aria-label="תובנות AI">

            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-none">
                            תובנות גולדה
                        </h2>
                     
                    </div>
                </div>
            </div>

            {/* Insights list */}
            {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-8 rounded-2xl border border-dashed border-border bg-muted/10 text-center gap-3">
                    <Lightbulb className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">כל התובנות נסקרו. גולדה תוסיף חדשות בקרוב!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visible.map((insight) => {
                        const typeConf = TYPE_CONFIG[insight.type];
                        const TypeIcon = typeConf.icon;
                        const isExpanded = expanded === insight.id;

                        return (
                            <div
                                key={insight.id}
                                id={`insight-${insight.id}`}
                                className={`
                                    group bg-card border border-border border-r-4 ${typeConf.border}
                                    rounded-2xl shadow-sm hover:shadow-md
                                    transition-all duration-300
                                `}
                            >
                                {/* Collapsed header — always visible */}
                                <div
                                    className="flex items-start gap-3 p-4 cursor-pointer"
                                    onClick={() => setExpanded(isExpanded ? null : insight.id)}
                                    role="button"
                                    aria-expanded={isExpanded}
                                    aria-controls={`insight-body-${insight.id}`}
                                >
                                    {/* Type icon */}
                                    <div className={`w-9 h-9 rounded-xl ${typeConf.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                                        <TypeIcon className={`w-4.5 h-4.5 ${typeConf.iconColor}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            {insight.isNew && (
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20 tracking-wider uppercase">
                                                    חדש
                                                </span>
                                            )}
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${typeConf.badgeBg} ${typeConf.badgeText}`}>
                                                {TYPE_LABEL[insight.type]}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {insight.timestamp} · {insight.agent}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-foreground leading-snug">
                                            {insight.title}
                                        </h3>
                                    </div>

                                    {/* Controls */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); dismiss(insight.id); }}
                                            aria-label="בטל תובנה"
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <ChevronRight
                                            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "-rotate-90" : "rotate-90"}`}
                                        />
                                    </div>
                                </div>

                                {/* Expanded body */}
                                {isExpanded && (
                                    <div
                                        id={`insight-body-${insight.id}`}
                                        className="px-4 pb-4 border-t border-border/40 pt-3"
                                    >
                                        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-3 border border-border/50 mb-4">
                                            {insight.body}
                                        </p>

                                        {/* Action buttons */}
                                        {insight.actions && insight.actions.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {insight.actions.map((action) => {
                                                    const ActionIcon = action.icon;
                                                    return (
                                                        <button
                                                            key={action.id}
                                                            id={`insight-action-${action.id}`}
                                                            className={`
                                                                flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl
                                                                transition-all duration-200 shadow-sm
                                                                ${action.variant === "primary"
                                                                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md"
                                                                    : "bg-muted text-foreground hover:bg-muted/80 border border-border"
                                                                }
                                                            `}
                                                        >
                                                            <ActionIcon className="w-3.5 h-3.5" />
                                                            {action.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
