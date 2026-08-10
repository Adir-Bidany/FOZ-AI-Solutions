"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, MessageSquare, Bot, User, Loader2 } from "lucide-react";
import { fetchCustomerChatHistory, type ChatSession, type ChatMessage } from "@/actions/dashboard";

interface CustomerChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    customerName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateLabel(iso: string): string {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "היום";
    if (date.toDateString() === yesterday.toDateString()) return "אתמול";
    return date.toLocaleDateString("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function isSameDay(a: string, b: string): boolean {
    return new Date(a).toDateString() === new Date(b).toDateString();
}

// ─── Flatten all sessions into a unified message timeline ────────────────────

interface FlatMessage extends ChatMessage {
    sessionId: string;
}

function flattenSessions(sessions: ChatSession[]): FlatMessage[] {
    return sessions
        .flatMap((s) =>
            s.messages.map((m) => ({
                ...m,
                sessionId: s.sessionId,
                timestamp: m.timestamp || s.createdAt,
            }))
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomerChatModal({
    isOpen,
    onClose,
    customerId,
    customerName,
}: CustomerChatModalProps) {
    const [messages, setMessages] = useState<FlatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen || !customerId) return;
        setLoading(true);
        fetchCustomerChatHistory(customerId)
            .then((sessions) => setMessages(flattenSessions(sessions)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [isOpen, customerId]);

    // Scroll to bottom when messages load
    useEffect(() => {
        if (!loading) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [loading, messages]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label={`היסטוריית שיחה עם ${customerName}`}
        >
            <div
                className="bg-card rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden border border-border"
                style={{ maxHeight: "85vh" }}
                dir="rtl"
            >
                {/* ─── Header ─── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-foreground">{customerName}</h2>
                            <p className="text-xs text-muted-foreground">שיחה עם דניאלה</p>
                        </div>
                    </div>
                    <button
                        id="customer-chat-modal-close"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="סגור"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ─── Messages Body ─── */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1 bg-muted/20">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                            <Loader2 className="w-7 h-7 text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">טוען שיחה...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">אין היסטוריית שיחה</p>
                            <p className="text-xs text-muted-foreground max-w-xs">
                                עדיין לא נוהלה שיחה עם לקוח זה דרך דניאלה.
                            </p>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => {
                                const isUser = msg.role === "user";
                                const prevMsg = messages[idx - 1];
                                const showDateSeparator =
                                    idx === 0 ||
                                    (prevMsg && !isSameDay(prevMsg.timestamp, msg.timestamp));

                                return (
                                    <React.Fragment key={`${msg.sessionId}-${idx}`}>
                                        {/* Date Separator */}
                                        {showDateSeparator && (
                                            <div className="flex items-center justify-center my-4">
                                                <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border/50">
                                                    {formatDateLabel(msg.timestamp)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Message Bubble */}
                                        <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                                            {/* Avatar */}
                                            <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] ${
                                                isUser
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300"
                                            }`}>
                                                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                            </div>

                                            {/* Bubble */}
                                            <div
                                                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                    isUser
                                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                        : "bg-card border border-border text-foreground rounded-tl-sm"
                                                }`}
                                            >
                                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${isUser ? "text-primary-foreground/60 text-left" : "text-muted-foreground text-right"}`}>
                                                    {formatTime(msg.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                            <div ref={bottomRef} />
                        </>
                    )}
                </div>

                {/* ─── Footer ─── */}
                <div className="px-5 py-3 border-t border-border bg-card/80 shrink-0">
                    <p className="text-[11px] text-center text-muted-foreground">
                        {messages.length > 0
                            ? `${messages.length} הודעות בשיחה`
                            : "קריאה בלבד — ניתן לראות אך לא לשלוח הודעות מכאן"}
                    </p>
                </div>
            </div>
        </div>
    );
}
