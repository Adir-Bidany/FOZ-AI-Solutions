"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
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
    Check,
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
    target_scope: "GLOBAL" | "PAZ" | "FOZ" | "DANIELA" | "GOLDA";
    topic_title: string;
    content: string;
    is_active: boolean;
    sort_order: number;
    description?: string;
}

interface PromptCMSModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SCOPES = [
    { id: "GLOBAL", label: "כלל הסוכנים", icon: Globe, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { id: "PAZ", label: "פז", icon: Bot, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
    { id: "DANIELA", label: "דניאלה", icon: UserCheck, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
    { id: "GOLDA", label: "גולדה", icon: Crown, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
] as const;

export default function PromptCMSModal({ isOpen, onClose }: PromptCMSModalProps) {
    const [blocks, setBlocks] = useState<PromptBlock[]>([]);
    const [activeScope, setActiveScope] = useState<"GLOBAL" | "PAZ" | "FOZ" | "DANIELA" | "GOLDA">("GLOBAL");
    const [isLoading, setIsLoading] = useState(false);
    const [savingId, setSavingId] = useState<string | null>(null);

    // Form state for creating a new block
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newContent, setNewContent] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadBlocks();
        }
    }, [isOpen]);

    const loadBlocks = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllPromptBlocks();
            setBlocks(data);
        } catch (error) {
            console.error("Failed to load prompt blocks:", error);
            toast.error("שגיאה שטעינת בלוקי הפרומפטים");
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
                target_scope: activeScope,
                topic_title: newTitle.trim(),
                content: newContent.trim(),
            });

            if (res.success && res.block) {
                setBlocks((prev) => [...prev, res.block]);
                setShowCreateForm(false);
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

    const filteredBlocks = blocks.filter((b) => b.target_scope === activeScope);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden bg-card border-border rounded-3xl dir-rtl"
                dir="rtl"
            >
                {/* Modal Header */}
                <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-extrabold text-foreground">
                                מרכז ניהול פרומפטים והנחיות (Prompt CMS)
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                ניהול מודולרי של הנחיות המערכת, חוקי הבטיחות והטון של סוכני ה-AI בזמן אמת
                            </DialogDescription>
                        </div>
                    </div>

                    {/* Scope Filter Tabs */}
                    <div className="flex items-center gap-2 pt-4 overflow-x-auto no-scrollbar">
                        {SCOPES.map((scope) => {
                            const Icon = scope.icon;
                            const isActive = activeScope === scope.id;
                            const count = blocks.filter((b) => b.target_scope === scope.id).length;

                            return (
                                <button
                                    key={scope.id}
                                    type="button"
                                    onClick={() => setActiveScope(scope.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer shrink-0",
                                        isActive
                                            ? scope.color
                                            : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{scope.label}</span>
                                    <span className="text-[10px] opacity-70 bg-background/50 px-1.5 py-0.5 rounded-full">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </DialogHeader>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/10">
                    {/* Add New Block Trigger */}
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-muted-foreground">
                            {SCOPES.find((s) => s.id === activeScope)?.label} — {filteredBlocks.length} בלוקים
                        </p>
                        <Button
                            size="sm"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-xl text-xs gap-1.5 font-bold"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {showCreateForm ? "ביטול" : "הוסף בלוק חדש"}
                        </Button>
                    </div>

                    {/* Inline Create Form */}
                    {showCreateForm && (
                        <form
                            onSubmit={handleCreateBlock}
                            className="p-5 rounded-2xl bg-card border border-primary/30 space-y-4 animate-in fade-in slide-in-from-top-2"
                        >
                            <h4 className="text-sm font-bold text-foreground">יצירת בלוק הנחיות חדש עבור {SCOPES.find((s) => s.id === activeScope)?.label}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">שם/כותרת הבלוק</label>
                                    <Input
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="למשל: חוקי הנחות ומבצעים"
                                        className="bg-background text-xs h-9 rounded-xl border-border"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1 block">מזהה ייחודי (Key Identifier)</label>
                                    <Input
                                        value={newKey}
                                        onChange={(e) => setNewKey(e.target.value)}
                                        placeholder="למשל: daniela_discounts_rule"
                                        className="bg-background text-xs h-9 rounded-xl border-border dir-ltr text-left"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground mb-1 block">תוכן ההנחיות (Markdown)</label>
                                <textarea
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    rows={4}
                                    placeholder="הקלד כאן את תוכן ההנחיות..."
                                    className="w-full bg-background border border-border text-foreground p-3 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCreateForm(false)}
                                    className="h-8 text-xs rounded-xl"
                                >
                                    ביטול
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    size="sm"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs rounded-xl font-bold gap-1.5"
                                >
                                    {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    צור בלוק
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="w-7 h-7 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">טוען פרומפטים...</p>
                        </div>
                    ) : filteredBlocks.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-card border border-dashed border-border text-center space-y-2">
                            <Sliders className="w-6 h-6 text-muted-foreground mx-auto" />
                            <h3 className="text-sm font-bold text-foreground">אין בלוקי הנחיות בקטגוריה זו</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                לחץ על "הוסף בלוק חדש" כדי להוסיף הנחיות מותאמות אישית.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBlocks.map((block) => (
                                <div
                                    key={block._id}
                                    className={cn(
                                        "bg-card rounded-2xl border transition-all overflow-hidden shadow-xs",
                                        block.is_active ? "border-border" : "border-border/40 opacity-60 bg-muted/20"
                                    )}
                                >
                                    {/* Block Header */}
                                    <div className="flex items-center justify-between p-4 bg-muted/20 border-b border-border/60">
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleActive(block)}
                                                className={cn(
                                                    "w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer",
                                                    block.is_active
                                                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                                )}
                                                title={block.is_active ? "לחץ להשבתה" : "לחץ להפעלה"}
                                            >
                                                <Power className="w-3.5 h-3.5" />
                                            </button>
                                            <div>
                                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    {block.topic_title}
                                                    {!block.is_active && (
                                                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-normal">
                                                            מושהה
                                                        </span>
                                                    )}
                                                </h3>
                                                <span className="text-[10px] text-muted-foreground font-mono">
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
                                                שמור
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Block Content Editor */}
                                    <div className="p-4">
                                        <textarea
                                            value={block.content}
                                            onChange={(e) => handleContentChange(block._id, e.target.value)}
                                            rows={6}
                                            className="w-full bg-background border border-border/60 text-foreground p-3.5 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
