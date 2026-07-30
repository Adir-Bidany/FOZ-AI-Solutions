"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { completeActionCard } from "@/actions/dashboard";
import { toast } from "sonner";

interface ActionItem {
    _id: string;
    source_agent?: string;
    status: string;
    priority?: string;
    display_content: {
        title: string;
        description: string;
        icon?: string;
    };
    created_at?: string;
}

interface ActionsDialogProps {
    pendingCards: ActionItem[];
    pendingCount: number;
}

export default function ActionsDialog({ pendingCards: initialCards, pendingCount: initialCount }: ActionsDialogProps) {
    const [cards, setCards] = useState<ActionItem[]>(initialCards);
    const [open, setOpen] = useState(false);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const pendingList = cards.filter((c) => c.status === "pending");
    const count = pendingList.length;

    const handleMarkAsDone = async (cardId: string) => {
        setLoadingId(cardId);
        try {
            const res = await completeActionCard(cardId);
            if (res.success) {
                setCards((prev) => prev.filter((c) => c._id !== cardId));
                toast.success("המשימה סומנה כבוצעה בהצלחה");
            } else {
                toast.error("שגיאה בעדכון סטטוס המשימה");
            }
        } catch (error) {
            console.error("Failed to complete card:", error);
            toast.error("אירעה שגיאה בשרת");
        } finally {
            setLoadingId(null);
        }
    };

    const cardMarkup = (
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-2xl overflow-hidden group cursor-pointer border border-transparent hover:border-primary/20">
            <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        פעולות להיום
                    </p>
                    <div className="flex items-baseline gap-3">
                        <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                            {count > 0 ? `${count} ממתינות` : "אין משימות"}
                        </h3>
                        {count > 0 && (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {count}
                            </span>
                        )}
                    </div>
                </div>
                <div className="mt-4">
                    <span className="text-xs font-medium text-primary hover:underline">
                        לחץ לצפייה בפרטים
                    </span>
                </div>
            </CardContent>
        </Card>
    );

    if (!mounted) {
        return cardMarkup;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {cardMarkup}
            </DialogTrigger>

            <DialogContent className="max-w-xl max-h-[85dvh] overflow-y-auto custom-scrollbar" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-xl font-bold text-foreground">
                        פעולות והודעות ממתינות ({count})
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        הודעות מלקוחות ומשימות שהתקבלו מנציגת ה-AI
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    {pendingList.length === 0 ? (
                        <div className="text-center py-10 space-y-3 bg-accent/20 rounded-2xl border border-dashed border-border">
                            <p className="text-foreground font-bold text-base">אין משימות ממתינות להיום!</p>
                            <p className="text-muted-foreground text-xs">כל ההודעות והבקשות סומנו כבוצעו.</p>
                        </div>
                    ) : (
                        pendingList.map((card) => {
                            const formattedDate = card.created_at
                                ? new Date(card.created_at).toLocaleTimeString("he-IL", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      day: "2-digit",
                                      month: "2-digit",
                                  })
                                : "עכשיו";

                            return (
                                <div
                                    key={card._id}
                                    className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all shadow-sm space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="text-foreground font-bold text-base">
                                            {card.display_content.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-mono">
                                            {formattedDate}
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed bg-accent/30 p-3 rounded-xl border border-border/50">
                                        {card.display_content.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            ממתין לטיפול
                                        </span>

                                        <Button
                                            size="sm"
                                            onClick={() => handleMarkAsDone(card._id)}
                                            disabled={loadingId === card._id}
                                            className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4"
                                        >
                                            {loadingId === card._id ? "מעדכן..." : "סמן כבוצע"}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
