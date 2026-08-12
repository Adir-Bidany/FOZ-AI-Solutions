"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import GlobalHeader from "@/components/GlobalHeader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sparkles,
    Loader2,
    Save,
    Plus,
    Trash2,
    Power,
    Sliders,
    Globe,
    Bot,
    UserCheck,
    Crown,
    ArrowRight,
    CheckCircle2,
    ShieldCheck,
} from "lucide-react";
import {
    fetchAllPromptBlocks,
    updatePromptBlock,
    createPromptBlock,
    deletePromptBlock,
} from "@/actions/prompts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface PromptBlock {
    _id: string;
    key_identifier: string;
    target_scope: "GLOBAL" | "PAZ" | "DANIELA" | "GOLDA";
    topic_title: string;
    content: string;
    is_active: boolean;
    sort_order: number;
    description?: string;
}

const SECTIONS = [
    {
        scope: "GLOBAL",
        title: "כלל הסוכנים (GLOBAL)",
        subtitle: "חוקי אבטחה ופיירוול גלובליים המוחלים על כל סוכני ה-AI במערכת",
        badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        icon: Globe,
    },
    {
        scope: "PAZ",
        title: "פז",
        subtitle: "הנחיות סוכן המכירות, הצמיחה והמידע עבור בעלי עסקים פוטנציאליים",
        badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        icon: Bot,
    },
    {
        scope: "DANIELA",
        title: "דניאלה (סוכנת קבלת פנים ותורים לעסקים)",
        subtitle: "הנחיות נציגת השירות, המכירות והתורים בעמוד הנחיתה של בעלי העסקים",
        badgeColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
        icon: UserCheck,
    },
    {
        scope: "GOLDA",
        title: "גולדה (סוכנת ניהול, שיווק ואנליטיקה)",
        subtitle: "הנחיות מנהלת העסק בדשבורד, כתיבת פוסטים שיווקיים והסטת שאלות טכניות",
        badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        icon: Crown,
    },
] as const;

export default function AdminPromptsPage() {
    const [blocks, setBlocks] = useState<PromptBlock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    // New block creation state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [targetScope, setTargetScope] = useState<"GLOBAL" | "PAZ" | "DANIELA" | "GOLDA">("GLOBAL");
    const [newKey, setNewKey] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadBlocks();
    }, []);

    const loadBlocks = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllPromptBlocks();
            setBlocks(data);
        } catch (error) {
            console.error("Failed to load prompt blocks:", error);
            toast.error("שגיאה בטעינת בלוקי הפרומפטים");
        } finally {
            setIsLoading(false);
        }
    };

    const handleContentChange = (id: string, newContent: string) => {
        setBlocks((prev) =>
            prev.map((b) => (b._id === id ? { ...b, content: newContent } : b))
        );
    };

    const handleToggleActive = async (block: PromptBlock) => {
        const nextStatus = !block.is_active;
        setBlocks((prev) =>
            prev.map((b) => (b._id === block._id ? { ...b, is_active: nextStatus } : b))
        );

        try {
            const res = await updatePromptBlock(block._id, { is_active: nextStatus });
            if (res.success) {
                toast.success(nextStatus ? "הבלוק הופעל בהצלחה" : "הבלוק הושבת");
            } else {
                toast.error("עדכון הסטטוס נכשל");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בעדכון הסטטוס");
        }
    };

    const handleSaveBlock = async (block: PromptBlock) => {
        setSavingId(block._id);
        try {
            const res = await updatePromptBlock(block._id, {
                content: block.content,
                topic_title: block.topic_title,
                is_active: block.is_active,
            });

            if (res.success) {
                toast.success(`הפרומפט "${block.topic_title}" עודכן ונשמר בהצלחה!`);
            } else {
                toast.error(res.error || "שגיאה בשמירת השינויים");
            }
        } catch (error) {
            console.error(error);
            toast.error("תקלה בשמירת הפרומפט");
        } finally {
            setSavingId(null);
        }
    };

    const handleDeleteBlock = async (blockId: string, title: string) => {
        if (!confirm(`האם את/ה בטוח/ה שברצונך למחוק את הבלוק "${title}"?`)) return;

        try {
            const res = await deletePromptBlock(blockId);
            if (res.success) {
                setBlocks((prev) => prev.filter((b) => b._id !== blockId));
                toast.success("הבלוק נמחק בהצלחה");
            } else {
                toast.error(res.error || "המחיקה נכשלה");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאה במחיקת הבלוק");
        }
    };

    const handleCreateBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKey.trim() || !newTitle.trim() || !newContent.trim()) {
            toast.error("יש למלא את כל שדות החובה");
            return;
        }

        setIsCreating(true);
        try {
            const res = await createPromptBlock({
                key_identifier: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
                target_scope: targetScope,
                topic_title: newTitle.trim(),
                content: newContent.trim(),
            });

            if (res.success && res.block) {
                setBlocks((prev) => [...prev, res.block]);
                setShowCreateModal(false);
                setNewKey("");
                setNewTitle("");
                setNewContent("");
                toast.success("בלוק הנחיות חדש נוצר בהצלחה!");
            } else {
                toast.error(res.error || "שגיאה ביצירת הבלוק");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאה ביצירת הבלוק");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground dir-rtl pb-24" dir="rtl">
            <GlobalHeader />

            <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8 space-y-8">
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border shadow-xs">
                    <div className="space-y-1">

                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3"> 
                            הגדרות וניהול סוכני AI
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            עריכה דינמית ומודולרית של כלל הפרומפטים וההנחיות לשיפור ביצועי הסוכנים בזמן אמת
                        </p>
                    </div>
                </div>

                {/* Loading Spinner */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">טוען פרומפטים והנחיות</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {SECTIONS.map((sec) => {
                            const secBlocks = blocks.filter((b) => b.target_scope === sec.scope);
                            const Icon = sec.icon;

                            return (
                                <section key={sec.scope} className="space-y-4">
                                    {/* Section Header */}
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/60">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-xl border", sec.badgeColor)}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-foreground">{sec.title}</h2>
                                                <p className="text-xs text-muted-foreground">{sec.subtitle}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Block Cards */}
                                    {secBlocks.length === 0 ? (
                                        <div className="p-6 rounded-2xl bg-card border border-dashed border-border/60 text-center">
                                            <p className="text-xs text-muted-foreground">אין בלוקי הנחיות מוגדרים בקטגוריה זו.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {secBlocks.map((block) => (
                                                <div
                                                    key={block._id}
                                                    className={cn(
                                                        "bg-card rounded-2xl border transition-all overflow-hidden shadow-xs",
                                                        block.is_active ? "border-border" : "border-border/40 opacity-60 bg-muted/20"
                                                    )}
                                                >
                                                    {/* Card Title & Controls Header */}
                                                    <div className="flex items-center justify-between p-4 bg-muted/20 border-b border-border/60">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleActive(block)}
                                                                className={cn(
                                                                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                                                                    block.is_active
                                                                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                                )}
                                                                title={block.is_active ? "לחץ להשבתה" : "לחץ להפעלה"}
                                                            >
                                                                <Power className="w-4 h-4" />
                                                            </button>
                                                            <div>
                                                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                                                    {block.topic_title}
                                                                    {!block.is_active && (
                                                                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full font-medium">
                                                                            מושהה
                                                                        </span>
                                                                    )}
                                                                </h3>
                                                                <span className="text-[11px] text-muted-foreground font-mono">
                                                                    key: {block.key_identifier}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDeleteBlock(block._id, block.topic_title)}
                                                                className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                                                title="מחק בלוק"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleSaveBlock(block)}
                                                                disabled={savingId === block._id}
                                                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-xl text-xs gap-1.5 font-bold"
                                                            >
                                                                {savingId === block._id ? (
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                ) : (
                                                                    <Save className="w-3.5 h-3.5" />
                                                                )}
                                                                שמור שינויים
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Card Markdown Textarea Editor */}
                                                    <div className="p-4">
                                                        <textarea
                                                            value={block.content}
                                                            onChange={(e) => handleContentChange(block._id, e.target.value)}
                                                            rows={7}
                                                            className="w-full bg-background border border-border/60 text-foreground p-4 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}
            </main>

        </div>
    );
}
