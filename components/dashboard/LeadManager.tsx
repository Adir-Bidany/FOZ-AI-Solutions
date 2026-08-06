"use client";

import React, { useState, useTransition } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, Trash2, User, Phone, Clock, MessageSquare, Inbox, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { markLeadAsHandled, deleteActionCardPermanently } from "@/actions/dashboard";

export interface LeadCard {
    _id: string;
    source_agent?: string;
    status: string;
    priority?: string;
    display_content: {
        title: string;
        description: string;
        icon?: string;
    };
    execution_payload?: {
        action_type?: string;
        params?: {
            customer_name?: string;
            message_content?: string;
            phone?: string;
            email?: string;
        };
    };
    created_at?: string;
}

interface LeadManagerProps {
    businessId: string;
    initialLeads?: LeadCard[];
}

const MOCK_LEADS: LeadCard[] = [
    {
        _id: "lead-mock-1",
        source_agent: "foz",
        status: "pending",
        priority: "high",
        display_content: {
            title: "פנייה חדשה מפז (FOZ AI): רועי לוי",
            description: "מתעניין בחבילת ה-AI לעסק קוסמטיקה. טלפון: 052-9876543, דוא\"ל: roi@clinic.co.il",
        },
        execution_payload: {
            action_type: "lead_capture",
            params: {
                customer_name: "רועי לוי",
                phone: "052-9876543",
                email: "roi@clinic.co.il",
                message_content: "רוצה לשמוע עוד על אינטגרציית וואטסאפ ליומן",
            },
        },
        created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
        _id: "lead-mock-2",
        source_agent: "receptionist",
        status: "pending",
        priority: "medium",
        display_content: {
            title: "הודעה מ-ספיר אברהם",
            description: "ביקשה שיחזרו אליה לגבי מחיר סדרת טיפולי לייזר. טלפון ליצירת קשר: 054-1234567",
        },
        execution_payload: {
            action_type: "send_message",
            params: {
                customer_name: "ספיר אברהם",
                phone: "054-1234567",
                message_content: "אשמח שמישהו יחזור אלי לגבי מחירים לטיפול לייזר סדרה של 10",
            },
        },
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
        _id: "lead-mock-3",
        source_agent: "foz",
        status: "completed",
        priority: "normal",
        display_content: {
            title: "פנייה מטופלת: עמית כהן",
            description: "הושארו פרטים: 050-5554433. נוצר קשר טלפוני והועבר להרשמה.",
        },
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
];

export default function LeadManager({ businessId, initialLeads = [] }: LeadManagerProps) {
    const activeInitial = initialLeads.length > 0 ? initialLeads : MOCK_LEADS;
    const [leads, setLeads] = useState<LeadCard[]>(activeInitial);
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const pendingLeads = leads.filter((l) => l.status === "pending");
    const handledLeads = leads.filter((l) => l.status === "completed" || l.status === "approved" || l.status === "dismissed");

    const handleMarkHandled = (leadId: string) => {
        setProcessingId(leadId);
        startTransition(async () => {
            try {
                if (!leadId.startsWith("lead-mock-")) {
                    await markLeadAsHandled(leadId);
                }
                setLeads((prev) =>
                    prev.map((l) => (l._id === leadId ? { ...l, status: "completed" } : l))
                );
                toast.success("הפנייה סומנה כטופלה בהצלחה ✓");
            } catch {
                toast.error("שגיאה בעדכון סטטוס הפנייה");
            } finally {
                setProcessingId(null);
            }
        });
    };

    const handleDelete = (leadId: string) => {
        setProcessingId(leadId);
        startTransition(async () => {
            try {
                if (!leadId.startsWith("lead-mock-")) {
                    await deleteActionCardPermanently(leadId);
                }
                setLeads((prev) => prev.filter((l) => l._id !== leadId));
                toast.success("הפנייה נמחקה מהמערכת");
            } catch {
                toast.error("שגיאה במחיקת הפנייה");
            } finally {
                setProcessingId(null);
            }
        });
    };

    return (
        <section id="lead-manager" className="space-y-6" aria-label="ניהול פניות ולידים">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                        <Inbox className="w-5 h-5 text-primary" />
                        ניהול פניות ולידים (Paz & Daniela)
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        ריכוז פניות שנאספו ע"י הסוכנים האוטונומיים — מעקב, טיפול ומחיקה
                    </p>
                </div>
            </div>

            {/* Tabs View */}
            <Tabs defaultValue="pending" className="w-full" dir="rtl">
                <TabsList className="grid w-full grid-cols-2 max-w-md bg-muted/60 p-1 rounded-2xl border border-border">
                    <TabsTrigger
                        value="pending"
                        className="rounded-xl text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-foreground shadow-none"
                    >
                        פניות חדשות
                        {pendingLeads.length > 0 && (
                            <span className="ms-2 px-2 py-0.5 text-[11px] rounded-full bg-primary/10 text-primary border border-primary/20">
                                {pendingLeads.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value="handled"
                        className="rounded-xl text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-foreground shadow-none"
                    >
                        כלל הפונים / טופלו
                        {handledLeads.length > 0 && (
                            <span className="ms-2 px-2 py-0.5 text-[11px] rounded-full bg-muted-foreground/10 text-muted-foreground border border-border">
                                {handledLeads.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Pending Leads Tab */}
                <TabsContent value="pending" className="mt-4 space-y-4">
                    {pendingLeads.length === 0 ? (
                        <div className="p-8 rounded-3xl bg-card border border-dashed border-border text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-foreground">אין פניות חדשות</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                כל הפניות והלידים שנאספו ע"י פז ודניאלה חולקו וטופלו!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingLeads.map((lead) => (
                                <LeadCardItem
                                    key={lead._id}
                                    lead={lead}
                                    isPendingTab={true}
                                    isProcessing={processingId === lead._id && isPending}
                                    onMarkHandled={() => handleMarkHandled(lead._id)}
                                    onDelete={() => handleDelete(lead._id)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Handled Leads Tab */}
                <TabsContent value="handled" className="mt-4 space-y-4">
                    {handledLeads.length === 0 ? (
                        <div className="p-8 rounded-3xl bg-card border border-dashed border-border text-center space-y-2">
                            <h3 className="text-base font-bold text-foreground">אין פניות בארכיון</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                פניות שתסמן כ"טופל" יופיעו כאן למעקב היסטורי.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {handledLeads.map((lead) => (
                                <LeadCardItem
                                    key={lead._id}
                                    lead={lead}
                                    isPendingTab={false}
                                    isProcessing={processingId === lead._id && isPending}
                                    onDelete={() => handleDelete(lead._id)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </section>
    );
}

interface LeadCardItemProps {
    lead: LeadCard;
    isPendingTab: boolean;
    isProcessing: boolean;
    onMarkHandled?: () => void;
    onDelete: () => void;
}

function LeadCardItem({ lead, isPendingTab, isProcessing, onMarkHandled, onDelete }: LeadCardItemProps) {
    const formattedTime = lead.created_at
        ? new Date(lead.created_at).toLocaleDateString("he-IL", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
          })
        : "עכשיו";

    const params = lead.execution_payload?.params;

    return (
        <div
            className={`
                bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-all duration-200
                flex flex-col justify-between gap-4
                ${isProcessing ? "opacity-50 pointer-events-none" : ""}
            `}
        >
            {/* Card Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <Sparkles className="w-3 h-3" />
                        {lead.source_agent === "foz" ? "פז (FOZ AI)" : "דניאלה (נציגה)"}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formattedTime}
                    </span>
                </div>

                <h3 className="text-base font-bold text-foreground leading-snug">
                    {lead.display_content.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-3 border border-border/40">
                    {lead.display_content.description}
                </p>

                {/* Additional Contact Info Details */}
                {params && (params.phone || params.email) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {params.phone && (
                            <a
                                href={`tel:${params.phone}`}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10"
                            >
                                <Phone className="w-3 h-3" />
                                {params.phone}
                            </a>
                        )}
                        {params.email && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-lg border border-border/50">
                                <User className="w-3 h-3" />
                                {params.email}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
                <button
                    onClick={onDelete}
                    disabled={isProcessing}
                    className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive px-3 py-1.5 rounded-xl hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    מחיקה
                </button>

                {isPendingTab && onMarkHandled && (
                    <button
                        onClick={onMarkHandled}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-xl shadow-sm transition-all hover:shadow-md"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isProcessing ? "מעבד..." : "טופל"}
                    </button>
                )}
            </div>
        </div>
    );
}
