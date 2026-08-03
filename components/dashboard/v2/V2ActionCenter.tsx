"use client";

import React, { useState, useTransition } from "react";
import { approveActionCard, dismissActionCard } from "@/actions/dashboard";
import {
    Zap,
    CheckCircle2,
    X,
    Clock,
    Sparkles,
    Bot,
    AlertTriangle,
    Info,
    HelpCircle,
    MessageSquare,
    Calendar,
    Users,
    TrendingUp,
    Gift,
    ShieldAlert,
    ChevronDown,
    ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ActionCard {
    _id: string;
    source_agent?: string;
    status: string;
    priority?: string;
    actionType?: string;
    display_content: {
        title: string;
        description: string;
        badgeText?: string;
        icon?: string;
        highlightMetric?: string;
    };
    primaryAction?: {
        label: string;
        actionCode: string;
    };
    created_at?: string;
}

interface V2ActionCenterProps {
    businessId: string;
    initialCards: ActionCard[];
    onCardsChange?: (cards: ActionCard[]) => void;
}

// ─── The 8 Strategic Action Types Metadata ─────────────────────────────────────

const ACTION_TYPES_INFO = [
    {
        title: "אישור תוכן שיווקי",
        titleEn: "Marketing Content Approval",
        icon: MegaphoneIcon,
        color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
        description: "פוסטים שיווקיים ותמונות AI שנוצרו ע\"י גולדה וממתינים לאישורך המהיר לפני פרסום.",
    },
    {
        title: "הסלמת שיחת לקוח",
        titleEn: "Human Escalation from WhatsApp",
        icon: MessageSquare,
        color: "text-red-500 bg-red-500/10 border-red-500/20",
        description: "התראה דחופה כאשר לקוח בוואטסאפ מבקש מענה אנושי או כאשר נדרשת התערבות מנהל.",
    },
    {
        title: "קמפיין 'התעוררות'",
        titleEn: "Win-Back Campaigns",
        icon: Users,
        color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
        description: "הצעה אוטומטית ומותאמת אישית ללקוחות שלא ביקרו בקליניקה מעל 60-90 ימים.",
    },
    {
        title: "מילוי תורים ברגע האחרון",
        titleEn: "Flash Fill",
        icon: Zap,
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        description: "זיהוי ביטול פתאומי ושליחת הצעות ממוקדות בלחיצת כפתור ללקוחות ברשימת ההמתנה.",
    },
    {
        title: "סידור וייעול היומן",
        titleEn: "Calendar Tetris / Optimization",
        icon: Calendar,
        color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
        description: "זיהוי חלונות זמן מבוזבזים ביומן והצעת הזזה/איחוד תורים למקסימום ניצול.",
    },
    {
        title: "התראת 'סיכון ביטול'",
        titleEn: "No-Show Risk Alerts",
        icon: ShieldAlert,
        color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
        description: "זיהוי תורים מחר שלא אושרו ע\"י לקוחות עם היסטוריית ביטולים.",
    },
    {
        title: "הצעות שדרוג להיום",
        titleEn: "Upsell / Cross-sell Suggestions",
        icon: TrendingUp,
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        description: "המלצה לשדרוג טיפול או מוצר נלווה מותאם אישית ללקוחות המוזמנים להיום.",
    },
    {
        title: "מעקב טיפולי וימי הולדת",
        titleEn: "VIP Care & Check-ins",
        icon: Gift,
        color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
        description: "הודעות התעניינות 24-48 שעות לאחר טיפול וברכות יום הולדת אישיות.",
    },
];

function MegaphoneIcon(props: any) {
    return <Sparkles {...props} />;
}

// ─── Default Strategic Mock Cards ─────────────────────────────────────────────

const MOCK_ACTION_CARDS: ActionCard[] = [
    {
        _id: "mock-1",
        source_agent: "Golda (WhatsApp)",
        status: "pending",
        priority: "urgent",
        actionType: "human_escalation",
        display_content: {
            title: "הסלמת שיחה: דניאל כהן מבקש לדבר עם מנהל העסק",
            description: "דניאל שאל לגבי סדרת טיפולי לייזר מורכבת וביקש מענה אנושי. השיחה הועברה לטיפולך המהיר.",
            badgeText: "מענה דחוף",
            highlightMetric: "דניאל כהן",
        },
        primaryAction: {
            label: "פתח שיחה בוואטסאפ",
            actionCode: "OPEN_WHATSAPP",
        },
        created_at: new Date().toISOString(),
    },
    {
        _id: "mock-2",
        source_agent: "Golda (Calendar)",
        status: "pending",
        priority: "high",
        actionType: "flash_fill",
        display_content: {
            title: "מילוי תור מבוטל: מחר ב-10:00 (טיפול פנים)",
            description: "שרה ביטלה את התור. גולדה זיהתה 3 לקוחות מתאימות ברשימת ההמתנה ומוכנה לשלוח להן הצעה.",
            badgeText: "מילוי תור",
            highlightMetric: "חיסכון של ₪350",
        },
        primaryAction: {
            label: "אשר שליחה ל-3 לקוחות",
            actionCode: "FLASH_FILL_SEND",
        },
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
        _id: "mock-3",
        source_agent: "Golda (AI Engine)",
        status: "pending",
        priority: "info",
        actionType: "winback_campaign",
        display_content: {
            title: "קמפיין התעוררות: 5 לקוחות לא ביקרו מעל 60 יום",
            description: "גולדה הכינה הודעת 'התגעגענו' אישית עם 15% הנחה ללקוחות שלא ביקרו בקליניקה לאחרונה.",
            badgeText: "קמפיין חזרה",
            highlightMetric: "פוטנציאל ₪1,750",
        },
        primaryAction: {
            label: "אשר קמפיין בוואטסאפ",
            actionCode: "WINBACK_SEND",
        },
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
        _id: "mock-4",
        source_agent: "Golda (Smart Upsell)",
        status: "pending",
        priority: "normal",
        actionType: "upsell_crosssell",
        display_content: {
            title: "הצעת שדרוג להיום: טיפול קולגן למיכל שפירא",
            description: "מיכל מוזמנת להיום ב-14:00 לניקוי עמוק. בהתבסס על ההיסטוריה, מומלץ להציע שדרוג למסכת קולגן.",
            badgeText: "שדרוג להיום",
            highlightMetric: "תוספת ₪120",
        },
        primaryAction: {
            label: "שמור תזכורת לטיפול",
            actionCode: "UPSELL_SAVE",
        },
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
];

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
    urgent: {
        label: "דחוף",
        borderColor: "border-r-red-500",
        badgeBg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        dot: "bg-red-500",
        icon: AlertTriangle,
    },
    high: {
        label: "גבוה",
        borderColor: "border-r-amber-500",
        badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        dot: "bg-amber-500",
        icon: AlertTriangle,
    },
    normal: {
        label: "רגיל",
        borderColor: "border-r-primary",
        badgeBg: "bg-primary/10 text-primary border-primary/20",
        dot: "bg-primary",
        icon: Zap,
    },
    info: {
        label: "מידע",
        borderColor: "border-r-purple-500",
        badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        dot: "bg-purple-400",
        icon: Info,
    },
} as const;

type PriorityKey = keyof typeof PRIORITY_CONFIG;

function getPriorityKey(card: ActionCard): PriorityKey {
    const p = card.priority?.toLowerCase();
    if (p === "urgent" || p === "high" || p === "normal" || p === "info") return p;
    return "normal";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function V2ActionCenter({
    businessId,
    initialCards,
    onCardsChange,
}: V2ActionCenterProps) {
    // If no initial real cards, use default strategic mock cards for layout visualization
    const activeInitial = initialCards.length > 0 ? initialCards : MOCK_ACTION_CARDS;
    const [cards, setCards] = useState<ActionCard[]>(activeInitial);
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const pendingCards = cards.filter((c) => c.status === "pending");

    const updateCards = (newCards: ActionCard[]) => {
        setCards(newCards);
        onCardsChange?.(newCards);
    };

    const handleApprove = (cardId: string) => {
        setProcessingId(cardId);
        startTransition(async () => {
            try {
                // If it's a real card from DB, run server action
                if (!cardId.startsWith("mock-")) {
                    await approveActionCard(cardId);
                }
                updateCards(cards.map((c) => (c._id === cardId ? { ...c, status: "approved" } : c)));
                toast.success("הפעולה אושרה ובוצעה בהצלחה ✓");
            } catch {
                toast.error("אירעה שגיאה בביצוע הפעולה");
            } finally {
                setProcessingId(null);
            }
        });
    };

    const handleDismiss = (cardId: string) => {
        setProcessingId(cardId);
        startTransition(async () => {
            try {
                if (!cardId.startsWith("mock-")) {
                    await dismissActionCard(cardId);
                }
                updateCards(cards.filter((c) => c._id !== cardId));
                toast.success("הפעולה הוסרה מהמרכז");
            } catch {
                toast.error("אירעה שגיאה בביטול הפעולה");
            } finally {
                setProcessingId(null);
            }
        });
    };

    return (
        <section id="v2-action-center" aria-label="מרכז הפעולות">

            {/* ── Section Header ── */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                        <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-none">
                                מרכז הפעולות
                            </h2>

                            {/* Help/Info Icon Trigger */}
                            <button
                                onClick={() => setIsInfoModalOpen(true)}
                                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                                title="למד על 8 סוגי הפעולות האוטומטיות"
                                aria-label="סוגי הפעולות במרכז"
                            >
                                <HelpCircle className="w-4 h-4 text-purple-500" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Agent Action Center</p>
                    </div>
                </div>

                {pendingCards.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            {pendingCards.length} ממתינות לטיפולך
                        </span>
                    </div>
                )}
            </div>

            {/* ── Action Cards Grid ── */}
            {pendingCards.length === 0 ? (
                <EmptyActionCenter />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {pendingCards.map((card) => {
                        const priorityKey = getPriorityKey(card);
                        const priority = PRIORITY_CONFIG[priorityKey];
                        const PriorityIcon = priority.icon;
                        const isProcessingThis = processingId === card._id && isPending;

                        const formattedTime = card.created_at
                            ? new Date(card.created_at).toLocaleTimeString("he-IL", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                              })
                            : "עכשיו";

                        return (
                            <div
                                key={card._id}
                                className={`
                                    group relative bg-card rounded-2xl border border-border border-r-4 ${priority.borderColor}
                                    shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col p-5 gap-4
                                    ${isProcessingThis ? "opacity-50 scale-[0.98] pointer-events-none" : "hover:-translate-y-0.5"}
                                `}
                            >
                                {/* ── Card Top: Badges + Time ── */}
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {/* Priority badge */}
                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${priority.badgeBg}`}>
                                            <PriorityIcon className="w-3 h-3" />
                                            {priority.label}
                                        </span>

                                        {/* Agent source chip */}
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                            <Sparkles className="w-3 h-3 text-purple-500" />
                                            {card.source_agent || "גולדה"}
                                        </span>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-mono">
                                        <Clock className="w-3 h-3" />
                                        <span>{formattedTime}</span>
                                    </div>
                                </div>

                                {/* ── Card Body ── */}
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-foreground leading-snug mb-2">
                                        {card.display_content.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-3 border border-border/50">
                                        {card.display_content.description}
                                    </p>

                                    {/* Highlight Metric Tag */}
                                    {card.display_content.highlightMetric && (
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                            <span>✨ {card.display_content.highlightMetric}</span>
                                        </div>
                                    )}
                                </div>

                                {/* ── Card Actions ── */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                                    <button
                                        onClick={() => handleDismiss(card._id)}
                                        disabled={isProcessingThis}
                                        className="text-xs font-semibold text-muted-foreground hover:text-destructive px-3 py-1.5 rounded-xl hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                                    >
                                        התעלם
                                    </button>
                                    <button
                                        onClick={() => handleApprove(card._id)}
                                        disabled={isProcessingThis}
                                        className="flex items-center gap-1.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-xl shadow-sm transition-all hover:shadow-md"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        {isProcessingThis ? "מעבד..." : card.primaryAction?.label || "אישור"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modal: 8 Action Types Explanation ── */}
            <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
                <DialogContent className="sm:max-w-2xl text-right rounded-3xl p-6 bg-card text-foreground border border-border" dir="rtl">
                    <DialogHeader className="text-right pb-3 border-b border-border">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                                מדריך מרכז הפעולות
                            </span>
                        </div>
                        <DialogTitle className="text-xl font-extrabold text-foreground">
                            8 הפעולות האוטומטיות של גולדה
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            גולדה סורקת את העסק 24/7 ומכינה עבורך משימות מוכנות לביצוע בלחיצת כפתור אחת
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {ACTION_TYPES_INFO.map((item, idx) => {
                            const ItemIcon = item.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2 hover:border-purple-500/30 transition-all"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${item.color}`}>
                                            <ItemIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-foreground leading-none">
                                                {item.title}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                                {item.titleEn}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyActionCenter() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 rounded-2xl border border-dashed border-border bg-muted/10 text-center gap-4 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
                <h3 className="text-lg font-bold text-foreground mb-1.5">
                    אין פעולות ממתינות! 🎉
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    כל המשימות הושלמו. גולדה ימשיך לעדכן כאן פעולות חדשות בזמן אמת.
                </p>
            </div>
        </div>
    );
}
