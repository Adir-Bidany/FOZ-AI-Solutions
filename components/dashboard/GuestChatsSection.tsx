"use client";

import React, { useEffect, useState } from "react";
import { Users, ChevronDown, ChevronRight, Bot, User, MessageSquare, Loader2 } from "lucide-react";
import { fetchGuestChats, type ChatSession } from "@/actions/dashboard";

interface GuestChatsSectionProps {
    businessId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSessionDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }) + " · " + date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatBubbleTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GuestChatsSection({ businessId }: GuestChatsSectionProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchGuestChats()
            .then(setSessions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [businessId]);

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
        <section
            id="guest-chats-section"
            className="space-y-5"
            aria-label="שיחות עם לקוחות מזדמנים"
            dir="rtl"
        >
            {/* Section Header */}
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                        שיחות עם לקוחות מזדמנים
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        אורחים שפנו דרך הצ׳אט ללא התחברות — {sessions.length} שיחות אחרונות
                    </p>
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
                    <h3 className="text-sm font-bold text-foreground">אין שיחות עם אורחים</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        כאשר מבקרים יפנו דרך הצ׳אט ללא התחברות, השיחות יופיעו כאן.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sessions.map((session, idx) => {
                        const isExpanded = expandedIds.has(session.sessionId);
                        const msgCount = session.messages.length;

                        return (
                            <div
                                key={session.sessionId}
                                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                                {/* Session Header — always visible, click to expand */}
                                <button
                                    id={`guest-chat-toggle-${session.sessionId}`}
                                    onClick={() => toggleExpand(session.sessionId)}
                                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors duration-150 text-right"
                                    aria-expanded={isExpanded}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground">
                                                לקוח מזדמן {idx + 1}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatSessionDate(session.createdAt)} · {msgCount} הודעות
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground">
                                        {isExpanded
                                            ? <ChevronDown className="w-4 h-4" />
                                            : <ChevronRight className="w-4 h-4" />
                                        }
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
                                                        <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                                                            isUser
                                                                ? "bg-muted-foreground/10 text-muted-foreground"
                                                                : "bg-violet-100 dark:bg-violet-950 text-violet-500"
                                                        }`}>
                                                            {isUser ? <User className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                                                        </div>

                                                        {/* Bubble */}
                                                        <div
                                                            className={`max-w-[80%] px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                                                                isUser
                                                                    ? "bg-muted border border-border text-foreground rounded-tr-sm"
                                                                    : "bg-violet-50 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-800/30 text-foreground rounded-tl-sm"
                                                            }`}
                                                        >
                                                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
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
