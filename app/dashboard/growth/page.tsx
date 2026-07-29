"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Lock, Sparkles, Save, Loader2, ShieldCheck, Eye, HelpCircle, Send, CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { resolveMissingInfoQuestion } from "@/actions/dashboard";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface MissingInfoCard {
    _id: string;
    display_content: {
        title: string;
        description: string;
    };
    execution_payload?: {
        params?: {
            question?: string;
            customer_name?: string;
        };
    };
    created_at: string;
}

export default function GrowthPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [publicInstructions, setPublicInstructions] = useState("");
    const [internalNotes, setInternalNotes] = useState("");

    // Missing Info Queue State
    const [missingInfoCards, setMissingInfoCards] = useState<MissingInfoCard[]>([]);
    const [selectedCard, setSelectedCard] = useState<MissingInfoCard | null>(null);
    const [answerInput, setAnswerInput] = useState("");
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        const loadGrowthData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/business/settings");
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data) {
                        setPublicInstructions(data.data.publicInstructions || "");
                        setInternalNotes(data.data.internalNotes || "");
                    }
                }

                // Fetch Action Cards for Missing Info Queue
                const cardsRes = await fetch("/api/dashboard/stats");
                if (cardsRes.ok) {
                    const cardsData = await cardsRes.json();
                    if (cardsData.actionCards) {
                        const missing = cardsData.actionCards.filter(
                            (c: any) => c.execution_payload?.action_type === "missing_info" && c.status === "pending"
                        );
                        setMissingInfoCards(missing);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        loadGrowthData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const res = await fetch("/api/business/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    publicInstructions,
                    internalNotes,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                toast.success("הגדרות הידע והצמיחה עודכנו בהצלחה!");
            } else {
                toast.error(data.error || "תקלה בשמירת ההגדרות.");
            }
        } catch (err) {
            console.error(err);
            toast.error("תקלה בחיבור לשרת.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSendAnswerToDaniela = async () => {
        if (!selectedCard || !answerInput.trim() || isResolving) return;

        setIsResolving(true);
        const question = selectedCard.execution_payload?.params?.question || selectedCard.display_content.description;

        try {
            const res = await resolveMissingInfoQuestion(selectedCard._id, question, answerInput.trim());
            if (res.success) {
                toast.success("התשובה נשלחה לדניאלה ועודכנה בבסיס הידע הציבורי!");
                
                // Append directly to UI state
                const newEntry = `\n\n- שאלה מלקוח: ${question}\n  תשובת העסק: ${answerInput.trim()}`;
                setPublicInstructions((prev) => prev + newEntry);

                // Remove resolved card from queue
                setMissingInfoCards((prev) => prev.filter((c) => c._id !== selectedCard._id));
                setSelectedCard(null);
                setAnswerInput("");
            } else {
                toast.error(res.error || "תקלה בעדכון המידע.");
            }
        } catch (err) {
            console.error("Resolve Missing Info Error:", err);
            toast.error("תקלה בעדכון המידע.");
        } finally {
            setIsResolving(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto font-sans" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/90 backdrop-blur-xl p-6 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl text-primary shrink-0">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">צמיחה, ידע והפרדת מידע</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            ניהול ידע העסק עם הפרדה קשיחה בין מידע ציבורי ללקוחות לבין תובנות פנימיות
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shrink-0 gap-2 shadow-sm"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    שמור הגדרות ידע
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* === SECTION 0: MISSING INFO QUEUE ("מידע שחסר לדניאלה") === */}
                    <Card className="bg-card/90 border-border shadow-sm rounded-3xl overflow-hidden backdrop-blur-xl">
                        <CardHeader className="border-b border-border/60 bg-primary/5 pb-4">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-primary" />
                                    <CardTitle className="text-lg font-bold text-foreground">
                                        מידע שחסר לדניאלה (תור שאלות ללא מענה)
                                    </CardTitle>
                                </div>
                                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                    {missingInfoCards.length} שאלות ממתינות לתשובה
                                </span>
                            </div>
                            <CardDescription className="text-muted-foreground text-xs pt-1">
                                שאלות שללקוחות שאלו בצ'אט הציבורי ולדניאלה לא הייתה תשובה עבורן. הוספת תשובה תזין את המידע ישירות לדניאלה!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {missingInfoCards.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500/80" />
                                    <p className="font-semibold text-sm text-foreground">כל הכבוד! לדניאלה יש תשובה לכל השאלות שנשאלו.</p>
                                    <p className="text-xs text-muted-foreground">כשלקוח ישאל שאלה ללא מענה, היא תופיע כאן אוטומטית.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {missingInfoCards.map((card) => {
                                        const questionText = card.execution_payload?.params?.question || card.display_content.description;
                                        const customerName = card.execution_payload?.params?.customer_name || "לקוח קצה";

                                        return (
                                            <div
                                                key={card._id}
                                                className="p-5 rounded-2xl bg-muted/40 border border-border flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span className="font-semibold text-primary flex items-center gap-1">
                                                            <MessageSquare className="w-3.5 h-3.5" /> מפי {customerName}
                                                        </span>
                                                        <span>{card.created_at ? new Date(card.created_at).toLocaleDateString("he-IL") : ""}</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-foreground leading-relaxed">
                                                        "{questionText}"
                                                    </p>
                                                </div>

                                                <Button
                                                    onClick={() => {
                                                        setSelectedCard(card);
                                                        setAnswerInput("");
                                                    }}
                                                    size="sm"
                                                    className="w-full gap-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm"
                                                >
                                                    <Send className="w-3.5 h-3.5" /> הוספת תשובה
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <form onSubmit={handleSave} className="space-y-8">
                        {/* SECTION 1: DANIELA PUBLIC KNOWLEDGE */}
                        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-primary" />
                                        <CardTitle className="text-lg font-bold text-foreground">
                                            שדה מידע ללקוחות (מועבר לדניאלה)
                                        </CardTitle>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                        גיוס ומתן שירות ללקוחות
                                    </span>
                                </div>
                                <CardDescription className="text-muted-foreground text-xs pt-1">
                                    מידע תפעולי, הוראות הגעה, מדיניות תורים ודגשים שדניאלה תענה לפיהם ללקוחות.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {/* Explicit UI Warning Label */}
                                <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 p-4 rounded-2xl text-xs leading-relaxed font-medium">
                                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm mb-0.5">⚠️ שים לב:</p>
                                        <p>מידע שייכתב כאן גלוי לכלל הלקוחות שמשוחחים עם דניאלה. אל תכתוב כאן נתונים פיננסיים או אסטרטגיות פנימיות.</p>
                                    </div>
                                </div>

                                <Textarea
                                    value={publicInstructions}
                                    onChange={(e) => setPublicInstructions(e.target.value)}
                                    rows={6}
                                    placeholder="לדוגמה: הקליניקה ממוקמת בקומה 3. חניה חינם ללקוחות בחניון הבניין. הגעה בלבוש נוח..."
                                    className="rounded-2xl border-border bg-background p-4 text-sm text-foreground focus-visible:ring-primary leading-relaxed font-sans"
                                />
                            </CardContent>
                        </Card>

                        {/* SECTION 2: GOLDA INTERNAL KNOWLEDGE */}
                        <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-border/60 bg-muted/30 pb-4">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-amber-500" />
                                        <CardTitle className="text-lg font-bold text-foreground">
                                            תובנות שיווקיות וניהוליות (גולדה בלבד)
                                        </CardTitle>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                        🔒 חסוי - מנהל בלבד
                                    </span>
                                </div>
                                <CardDescription className="text-muted-foreground text-xs pt-1">
                                    הערות פנימיות, יתרות תקציב, יעדים עסקיים ואסטרטגיה — נגיש אך ורק לגולדה בדשבורד.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {/* Explicit Private Badge */}
                                <div className="flex items-start gap-3 bg-muted/60 border border-border text-foreground p-4 rounded-2xl text-xs leading-relaxed font-medium">
                                    <ShieldCheck className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-bold text-sm mb-0.5">🔒 מידע פנימי - גולדה בלבד:</p>
                                        <p>מידע זה אינו נגיש לדניאלה בשום אופן ולא ייחשף לעולם ללקוחות קצה. גולדה משתמשת במידע זה בלבד להפקת דוחות ואסטרטגיה.</p>
                                    </div>
                                </div>

                                <Textarea
                                    value={internalNotes}
                                    onChange={(e) => setInternalNotes(e.target.value)}
                                    rows={5}
                                    placeholder="לדוגמה: יעד מכירות חודשי ₪50,000. להתמקד החודש בקידום חבילת בוטוקס. שולי רווח יעד 40%..."
                                    className="rounded-2xl border-border bg-background p-4 text-sm text-foreground focus-visible:ring-primary leading-relaxed font-sans"
                                />
                            </CardContent>
                        </Card>
                    </form>
                </div>
            )}

            {/* === INTERACTIVE ANSWER MODAL === */}
            <Dialog open={!!selectedCard} onOpenChange={(open) => !open && setSelectedCard(null)}>
                <DialogContent className="sm:max-w-xl dir-rtl text-right rounded-3xl p-6 bg-card text-foreground border border-border" dir="rtl">
                    <DialogHeader className="text-right pb-3 border-b border-border">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                מענה לשאלה ללא תשובה
                            </span>
                        </div>
                        <DialogTitle className="text-lg font-bold text-foreground mt-1">
                            "{selectedCard?.execution_payload?.params?.question || selectedCard?.display_content.description}"
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground pt-1">
                            הקלד את התשובה המלאה. בלחיצה על "שלח לדניאלה", התשובה תיכנס אוטומטית לבסיס הידע הציבורי של דניאלה.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-3">
                        <label className="text-xs font-bold text-foreground">התשובה של העסק (תועבר אוטומטית לדניאלה):</label>
                        <Textarea
                            value={answerInput}
                            onChange={(e) => setAnswerInput(e.target.value)}
                            rows={4}
                            placeholder="הקלד כאן את התשובה המלאה..."
                            className="rounded-2xl border-border bg-background p-4 text-sm text-foreground focus-visible:ring-primary leading-relaxed"
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between flex-row-reverse border-t border-border pt-4">
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSendAnswerToDaniela}
                                disabled={!answerInput.trim() || isResolving}
                                className="gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-2xl shadow-sm"
                            >
                                {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                שלח לדניאלה
                            </Button>
                            <Button
                                onClick={() => setSelectedCard(null)}
                                variant="outline"
                                className="rounded-2xl border-border text-foreground hover:bg-accent"
                            >
                                ביטול
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
