"use client";

import React, { useState, useEffect } from "react";
import { Users, ChevronDown, ChevronRight, Bot, User, MessageSquare, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteChatSession, bulkDeleteChatSessions } from "@/actions/dashboard";

export interface ChatMessage {
    role: "user" | "model" | "assistant";
    text: string;
    timestamp: string;
}

export interface ChatSession {
    sessionId: string;
    createdAt: string;
    messages: ChatMessage[];
    label?: string;
    preview?: string;
}

export interface SharedChatInboxUIProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    badgeText?: string;
    agentName?: string;
    sessions: ChatSession[];
    loading?: boolean;
    emptyStateTitle?: string;
    emptyStateDescription?: string;
    accentColor?: "violet" | "purple" | "indigo" | "primary";
    defaultCollapsed?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionDate(iso: string): string {
    const date = new Date(iso);
    return (
        date.toLocaleDateString("he-IL", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }) || iso
    );
}

function formatBubbleTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Color mappings ───────────────────────────────────────────────────────────

const colorStyles = {
    violet: {
        iconBg: "bg-violet-500/10 text-violet-500",
        badgeBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20",
        bubbleBg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200/50 dark:border-violet-800/30",
        botAvatarBg: "bg-violet-100 dark:bg-violet-950 text-violet-500",
        userBg: "bg-violet-500/10 text-foreground border border-violet-500/20",
        botBg: "bg-muted text-foreground border border-border",
    },
    purple: {
        iconBg: "bg-purple-500/10 text-purple-500",
        badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        bubbleBg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/50 dark:border-purple-800/30",
        botAvatarBg: "bg-purple-100 dark:bg-purple-950 text-purple-500",
        userBg: "bg-purple-500/10 text-foreground border border-purple-500/20",
        botBg: "bg-muted text-foreground border border-border",
    },
    indigo: {
        iconBg: "bg-indigo-500/10 text-indigo-500",
        badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
        bubbleBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-800/30",
        botAvatarBg: "bg-indigo-100 dark:bg-indigo-950 text-indigo-500",
        userBg: "bg-indigo-500/10 text-foreground border border-indigo-500/20",
        botBg: "bg-muted text-foreground border border-border",
    },
    primary: {
        iconBg: "bg-primary/10 text-primary",
        badgeBg: "bg-primary/10 text-primary border border-primary/20",
        bubbleBg: "bg-card border-border",
        botAvatarBg: "bg-primary/10 text-primary",
        userBg: "bg-primary/10 text-foreground border border-primary/20",
        botBg: "bg-muted text-foreground border border-border",
    },
};

export default function SharedChatInboxUI({
    title,
    description,
    icon,
    badgeText,
    agentName = "סוכן AI",
    sessions,
    loading = false,
    emptyStateTitle = "אין שיחות להצגה",
    emptyStateDescription = "כאשר יתקבלו פניות חדשות, הן יופיעו כאן.",
    accentColor = "violet",
    defaultCollapsed = true,
}: SharedChatInboxUIProps) {
    const [sessionList, setSessionList] = useState<ChatSession[]>(sessions);
    const [isContainerOpen, setIsContainerOpen] = useState(!defaultCollapsed);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const colors = colorStyles[accentColor] || colorStyles.violet;

    useEffect(() => {
        setSessionList(sessions);
        setSelectedIds(new Set());
    }, [sessions]);

    const toggleExpand = (sessionId: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(sessionId)) {
                next.delete(sessionId);
            } else {
                next.add(sessionId);
            }
            return next;
        });
    };

    const toggleSelectRow = (sessionId: string, e: React.MouseEvent | React.ChangeEvent) => {
        e.stopPropagation();
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(sessionId)) {
                next.delete(sessionId);
            } else {
                next.add(sessionId);
            }
            return next;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(sessionList.map((s) => s.sessionId)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm("האם למחוק שיחה זו לצמיתות?")) return;
        try {
            const res = await deleteChatSession(sessionId);
            if (res.success) {
                setSessionList((prev) => prev.filter((s) => s.sessionId !== sessionId));
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(sessionId);
                    return next;
                });
                toast.success("השיחה נמחקה בהצלחה ✓");
            } else {
                toast.error(res.error || "שגיאה במחיקת השיחה");
            }
        } catch {
            toast.error("שגיאה במחיקת השיחה");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`האם למחוק ${selectedIds.size} שיחות שנבחרו לצמיתות?`)) return;

        try {
            const idsArray = Array.from(selectedIds);
            const res = await bulkDeleteChatSessions(idsArray);
            if (res.success) {
                setSessionList((prev) => prev.filter((s) => !selectedIds.has(s.sessionId)));
                setSelectedIds(new Set());
                toast.success(`${res.deletedCount ?? idsArray.length} שיחות נמחקו בהצלחה ✓`);
            } else {
                toast.error(res.error || "שגיאה במחיקת השיחות");
            }
        } catch {
            toast.error("שגיאה במחיקת השיחות");
        }
    };

    return (
        <section className="space-y-5" aria-label={title} dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${colors.iconBg}`}>
                        {icon || <Users className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                                {title}
                            </h2>
                            {badgeText && (
                                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${colors.badgeBg}`}>
                                    {badgeText}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {description} — {sessionList.length} שיחות אחרונות
                        </p>
                    </div>
                </div>

                {/* Outer Collapsible Container Toggle Button */}
                <button
                    type="button"
                    onClick={() => setIsContainerOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted/50 text-xs font-bold text-foreground transition-all shadow-sm shrink-0"
                >
                    <span>
                        {isContainerOpen
                            ? "הסתר שיחות"
                            : `הצג את כל השיחות (${sessionList.length})`}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                            isContainerOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>
            </div>

            {/* Content Container */}
            {isContainerOpen && (
                <>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-3">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">טוען שיחות...</p>
                        </div>
                    ) : sessionList.length === 0 ? (
                        <div className="p-8 rounded-3xl bg-card border border-dashed border-border text-center space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-bold text-foreground">{emptyStateTitle}</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                {emptyStateDescription}
                            </p>
                        </div>
                    ) : (
                <div className="space-y-3">
                    {/* Bulk Selection Toolbar */}
                    <div className="flex items-center justify-between px-3.5 py-2 bg-card border border-border rounded-xl text-xs shadow-sm">
                        <label className="flex items-center gap-2 font-bold text-foreground cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={sessionList.length > 0 && selectedIds.size === sessionList.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span>בחר הכל ({sessionList.length})</span>
                        </label>
                        {selectedIds.size > 0 && (
                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold text-xs transition-all shadow-sm"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>מחק מסומנים ({selectedIds.size})</span>
                            </button>
                        )}
                    </div>

                    {sessionList.map((session, idx) => {
                        const isExpanded = expandedIds.has(session.sessionId);
                        const isSelected = selectedIds.has(session.sessionId);
                        const msgCount = session.messages.length;
                        const defaultLabel = `לקוח מזדמן ${idx + 1}`;
                        const displayLabel = session.label || defaultLabel;

                        return (
                            <div
                                key={session.sessionId}
                                className={`bg-card rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${isSelected ? "border-purple-500/50 bg-purple-500/5" : "border-border"}`}
                            >
                                {/* Session Header — always visible, click to expand */}
                                <div
                                    id={`chat-session-toggle-${session.sessionId}`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => toggleExpand(session.sessionId)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.preventDefault();
                                            toggleExpand(session.sessionId);
                                        }
                                    }}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors duration-150 text-right cursor-pointer"
                                    aria-expanded={isExpanded}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => toggleSelectRow(session.sessionId, e)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-4 h-4 rounded border-border text-purple-600 focus:ring-purple-500 cursor-pointer shrink-0"
                                            aria-label="בחר שיחה"
                                        />
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colors.iconBg}`}>
                                            {sessionList.length - idx}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                {displayLabel}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatSessionDate(session.createdAt)} · {msgCount} הודעות
                                            </p>
                                            {session.preview && (
                                                <p className="text-xs text-purple-400 dark:text-purple-300 font-medium truncate max-w-xs sm:max-w-md mt-0.5">
                                                    {session.preview}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSession(session.sessionId);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="מחק שיחה"
                                            aria-label="מחק שיחה"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Transcript */}
                                {isExpanded && (
                                    <div className="border-t border-border bg-muted/10 px-5 py-4 space-y-3 max-h-96 overflow-y-auto">
                                        {session.messages.length === 0 ? (
                                            <p className="text-xs text-muted-foreground text-center py-4">
                                                אין הודעות בשיחה זו.
                                            </p>
                                        ) : (
                                            session.messages.map((msg, mIdx) => {
                                                const isUser = msg.role === "user";
                                                return (
                                                    <div
                                                        key={mIdx}
                                                        className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                                                    >
                                                        {/* Avatar */}
                                                        <div
                                                            className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                                                                isUser
                                                                    ? "bg-muted-foreground/10 text-muted-foreground"
                                                                    : colors.botAvatarBg
                                                            }`}
                                                        >
                                                            {isUser ? <User className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                                                        </div>

                                                        {/* Bubble */}
                                                        <div
                                                            className={`max-w-[80%] px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                                                                isUser
                                                                    ? "bg-muted border border-border text-foreground rounded-tr-sm"
                                                                    : `${colors.bubbleBg} border text-foreground rounded-tl-sm`
                                                            }`}
                                                        >
                                                            {!isUser && agentName && (
                                                                <p className="text-[10px] font-bold text-muted-foreground mb-0.5">
                                                                    {agentName}
                                                                </p>
                                                            )}
                                                            <p className="whitespace-pre-wrap break-words">
                                                                {(() => {
                                                                    if (!msg.text) return "";
                                                                    try {
                                                                        const trimmed = msg.text.trim();
                                                                        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                                                                            const parsed = JSON.parse(trimmed);
                                                                            if (parsed && (parsed.conversational_reply || parsed.reply || parsed.text)) {
                                                                                return parsed.conversational_reply || parsed.reply || parsed.text;
                                                                            }
                                                                        }
                                                                    } catch (_) {}
                                                                    return msg.text;
                                                                })()}
                                                            </p>
                                                            <p className="text-[10px] mt-1 text-muted-foreground">
                                                                {formatBubbleTime(msg.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                    )}
                </>
            )}
        </section>
    );
}
