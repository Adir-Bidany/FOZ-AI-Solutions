"use client";

import React, { useState } from "react";
import { Users, ChevronDown, ChevronRight, Bot, User, MessageSquare, Loader2 } from "lucide-react";

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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionDate(iso: string): string {
    const date = new Date(iso);
    return (
        date.toLocaleDateString("he-IL", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }) +
        " · " +
        date.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
}

function formatBubbleTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

const colorStyles = {
    violet: {
        iconBg: "bg-violet-500/10 text-violet-500",
        badgeBg: "bg-violet-500/10 text-violet-500",
        bubbleBg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200/50 dark:border-violet-800/30",
        botAvatarBg: "bg-violet-100 dark:bg-violet-950 text-violet-500",
    },
    purple: {
        iconBg: "bg-purple-500/10 text-purple-500",
        badgeBg: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
        bubbleBg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200/50 dark:border-purple-800/30",
        botAvatarBg: "bg-purple-100 dark:bg-purple-950 text-purple-500",
    },
    indigo: {
        iconBg: "bg-indigo-500/10 text-indigo-500",
        badgeBg: "bg-indigo-500/10 text-indigo-500",
        bubbleBg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/50 dark:border-indigo-800/30",
        botAvatarBg: "bg-indigo-100 dark:bg-indigo-950 text-indigo-500",
    },
    primary: {
        iconBg: "bg-primary/10 text-primary",
        badgeBg: "bg-primary/10 text-primary border border-primary/20",
        bubbleBg: "bg-card border-border",
        botAvatarBg: "bg-primary/10 text-primary",
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
}: SharedChatInboxUIProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const colors = colorStyles[accentColor] || colorStyles.violet;

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

    return (
        <section className="space-y-5" aria-label={title} dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                            {description} — {sessions.length} שיחות אחרונות
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12 gap-3">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">טוען שיחות...</p>
                </div>
            ) : sessions.length === 0 ? (
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
                    {sessions.map((session, idx) => {
                        const isExpanded = expandedIds.has(session.sessionId);
                        const msgCount = session.messages.length;
                        const defaultLabel = `לקוח מזדמן ${idx + 1}`;
                        const displayLabel = session.label || defaultLabel;

                        return (
                            <div
                                key={session.sessionId}
                                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                {/* Session Header — always visible, click to expand */}
                                <button
                                    id={`chat-session-toggle-${session.sessionId}`}
                                    onClick={() => toggleExpand(session.sessionId)}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors duration-150 text-right"
                                    aria-expanded={isExpanded}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colors.iconBg}`}>
                                            {sessions.length - idx}
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
                                    <div className="text-muted-foreground">
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </div>
                                </button>

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
        </section>
    );
}
