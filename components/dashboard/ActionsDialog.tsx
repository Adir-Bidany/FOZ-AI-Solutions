"use client";

import React, { useState } from "react";
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
import { Bell, CheckCircle2, MessageSquare, Clock, User } from "lucide-react";
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-card rounded-2xl overflow-hidden group cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-900/40">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-muted-foreground mb-1">
                                פעולות להיום
                            </p>
                            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-foreground tracking-tight">
                                {count > 0 ? `${count} ממתינות` : "אין משימות"}
                            </h3>
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full mt-3 inline-flex items-center gap-1 border border-purple-100 dark:border-purple-900/40 group-hover:border-purple-200 transition-colors">
                                לחץ לצפייה <Bell size={12} />
                            </span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-sm group-hover:scale-110 transition-transform duration-300">
                            <Bell size={28} />
                        </div>
                    </CardContent>
                </Card>
            </DialogTrigger>

            <DialogContent className="max-w-xl max-h-[85dvh] overflow-y-auto custom-scrollbar" dir="rtl">
                <DialogHeader className="text-right">
                    <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                        <MessageSquare className="text-purple-600 dark:text-purple-400" size={22} />
                        פעולות והודעות ממתינות ({count})
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        הודעות מלקוחות ומשימות שהתקבלו מנציגת ה-AI
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    {pendingList.length === 0 ? (
                        <div className="text-center py-10 space-y-3 bg-accent/20 rounded-2xl border border-dashed border-border">
                            <CheckCircle2 size={40} className="mx-auto text-emerald-500 opacity-80" />
                            <p className="text-foreground font-semibold text-base">אין משימות ממתינות להיום!</p>
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
                                    className="p-4 rounded-2xl bg-card border border-border hover:border-purple-500/30 transition-all shadow-sm space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-foreground font-bold text-base">
                                            <User size={16} className="text-purple-500" />
                                            {card.display_content.title}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock size={12} />
                                            {formattedDate}
                                        </div>
                                    </div>

                                    <p className="text-muted-foreground text-sm leading-relaxed bg-accent/30 p-3 rounded-xl border border-border/50">
                                        {card.display_content.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            ממתין לטיפול
                                        </span>

                                        <Button
                                            size="sm"
                                            onClick={() => handleMarkAsDone(card._id)}
                                            disabled={loadingId === card._id}
                                            className="h-8 gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                        >
                                            <CheckCircle2 size={14} />
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
