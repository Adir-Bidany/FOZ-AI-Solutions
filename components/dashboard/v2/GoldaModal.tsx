"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    fetchInternalChat,
    sendInternalMessage,
    archiveCurrentSession,
} from "@/actions/dashboard";
import { Sparkles, Send, RotateCcw, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
    role: "user" | "model";
    parts: Array<{ text: string; mode?: string }>;
}

interface GoldaModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
}

// ─── Mode styling helpers ─────────────────────────────────────────────────────

type ChatMode = "marketing" | "analytics" | "core";

function getModeBorderClass(mode: ChatMode): string {
    switch (mode) {
        case "marketing": return "border-fuchsia-500/50";
        case "analytics": return "border-cyan-400/50";
        default:          return "border-purple-500/30";
    }
}

function getModeGlowClass(mode: ChatMode): string {
    switch (mode) {
        case "marketing": return "shadow-fuchsia-500/30";
        case "analytics": return "shadow-cyan-400/30";
        default:          return "shadow-purple-600/25";
    }
}

function getModeLabel(mode: ChatMode): string | null {
    if (mode === "marketing") return "מצב שיווק";
    if (mode === "analytics") return "מצב ניתוח";
    return null;
}

function getModeBadgeClass(mode: ChatMode): string {
    if (mode === "marketing") return "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20";
    if (mode === "analytics") return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
    return "";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoldaModal({ isOpen, onClose, businessId }: GoldaModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasLoadedRef = useRef(false);

    // ── Load chat history ──────────────────────────────────────────────────────
    const loadChat = useCallback(async () => {
        setIsLoading(true);
        try {
            const msgs = await fetchInternalChat(businessId, "golda");
            setMessages(msgs as ChatMessage[]);
        } catch (e) {
            console.error("GoldaModal: failed to load chat:", e);
        } finally {
            setIsLoading(false);
        }
    }, [businessId]);

    // Load once on first open
    useEffect(() => {
        if (isOpen && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadChat();
        }
        if (isOpen) {
            // Focus input after transition
            const t = setTimeout(() => inputRef.current?.focus(), 320);
            return () => clearTimeout(t);
        }
    }, [isOpen, loadChat]);

    // ── Auto-scroll to newest message ─────────────────────────────────────────
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, isSending]);

    // ── Keyboard: Escape to close ─────────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    // ── Prevent body scroll while modal open ──────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    // ── Actions ───────────────────────────────────────────────────────────────
    const handleNewChat = async () => {
        if (isLoading || isSending || isArchiving) return;
        setIsArchiving(true);
        try {
            await archiveCurrentSession(businessId, "golda");
            hasLoadedRef.current = false;
            await loadChat();
            hasLoadedRef.current = true;
        } catch (e) {
            console.error("GoldaModal: failed to archive:", e);
        } finally {
            setIsArchiving(false);
        }
    };

    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text || isSending) return;

        setMessages((prev) => [...prev, { role: "user", parts: [{ text }] }]);
        setInputValue("");
        setIsSending(true);

        try {
            const updated = await sendInternalMessage(businessId, "golda", text);
            setMessages(updated as ChatMessage[]);
        } catch (e) {
            console.error("GoldaModal: send failed:", e);
        } finally {
            setIsSending(false);
        }
    };

    // ── Derive active mode from last model message ────────────────────────────
    const lastModelMsg = [...messages].reverse().find((m) => m.role === "model");
    const activeMode: ChatMode = (lastModelMsg?.parts[0]?.mode as ChatMode) ?? "core";
    const modeLabel = getModeLabel(activeMode);

    // Don't render anything in the DOM when closed (avoids layout shift)
    if (!isOpen) return null;

    return (
        /* Backdrop */
        <div
            id="golda-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
            onClick={(e) => {
                if ((e.target as HTMLElement).id === "golda-modal-backdrop") onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label="שיחה עם גולדה"
        >
            {/* Dimmed backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* ── Modal Panel ── */}
            <div
                className={`
                    relative w-full max-w-2xl h-[82vh] max-h-[720px]
                    bg-card/95 backdrop-blur-xl
                    rounded-3xl border ${getModeBorderClass(activeMode)}
                    shadow-2xl ${getModeGlowClass(activeMode)}
                    flex flex-col overflow-hidden
                    animate-in slide-in-from-bottom-6 fade-in duration-300 ease-out
                `}
                dir="rtl"
            >

                {/* ── Modal Header ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0 bg-card/50">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-600/30 shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>

                        {/* Name + description */}
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-extrabold text-foreground leading-none">
                                    גולדה
                                </h2>
                                {modeLabel && (
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getModeBadgeClass(activeMode)}`}>
                                        {modeLabel}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                מנהלת עסק AI • תמיד כאן בשבילך
                            </p>
                        </div>
                    </div>

                    {/* Header actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button
                            onClick={handleNewChat}
                            disabled={isLoading || isSending || isArchiving}
                            title="ארכוב השיחה הנוכחית ופתיחת שיחה חדשה"
                            className="
                                flex items-center gap-1.5 text-xs font-semibold
                                text-muted-foreground hover:text-foreground
                                px-3 py-1.5 rounded-xl
                                hover:bg-muted border border-transparent hover:border-border
                                transition-all duration-200
                                disabled:opacity-40
                            "
                        >
                            <RotateCcw className={`w-3.5 h-3.5 ${isArchiving ? "animate-spin" : ""}`} />
                            <span className="hidden sm:inline">שיחה חדשה</span>
                        </button>

                        <button
                            id="golda-modal-close"
                            onClick={onClose}
                            aria-label="סגור שיחה עם גולדה"
                            className="
                                w-8 h-8 rounded-xl
                                flex items-center justify-center
                                text-muted-foreground hover:text-foreground
                                hover:bg-muted border border-transparent hover:border-border
                                transition-all duration-200
                            "
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Chat Messages Area ── */}
                <div
                    ref={scrollRef}
                    className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 bg-muted/15"
                >
                    <div className="space-y-4 pb-2">

                        {isLoading ? (
                            /* Loading dots */
                            <div className="flex items-center justify-center h-40">
                                <div className="flex items-center gap-2">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce"
                                            style={{ animationDelay: `${i * 150}ms` }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            /* Empty / welcome state */
                            <div className="flex flex-col items-center justify-center h-40 text-center gap-3 py-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/20 flex items-center justify-center">
                                    <Sparkles className="w-7 h-7 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">
                                        שלום! אני גולדה 👋
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                        כתבי לי כל שאלה עסקית ואשמח לעזור
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Messages */
                            messages.map((msg, idx) => {
                                const isUser = msg.role === "user";
                                return (
                                    <div
                                        key={idx}
                                        className={`flex w-full gap-2.5 items-start ${
                                            isUser ? "justify-start" : "justify-end"
                                        }`}
                                    >
                                        <Avatar
                                            className={`w-8 h-8 mt-0.5 shrink-0 ${
                                                isUser
                                                    ? "border-2 border-blue-500 ring-2 ring-blue-500/20"
                                                    : "border-2 border-purple-500 ring-2 ring-purple-500/20"
                                            }`}
                                        >
                                            <AvatarImage src="/logo.png" className="object-cover" />
                                            <AvatarFallback
                                                className={`text-xs font-bold ${
                                                    isUser
                                                        ? "bg-blue-500/10 text-blue-500"
                                                        : "bg-purple-500/10 text-purple-500"
                                                }`}
                                            >
                                                {isUser ? "U" : "ג"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div
                                            className={`
                                                max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed
                                                ${isUser
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-card border border-border text-foreground rounded-tl-sm"
                                                }
                                            `}
                                        >
                                            {msg.parts[0].text}
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {/* Typing indicator */}
                        {isSending && (
                            <div className="flex justify-end gap-2.5 items-start">
                                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-1.5">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"
                                                style={{ animationDelay: `${i * 150}ms` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full border-2 border-purple-500 ring-2 ring-purple-500/20 bg-purple-500/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Input Area ── */}
                <div className="shrink-0 px-4 py-4 border-t border-border/40 bg-card/50">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            id="golda-modal-input"
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="כתבי כאן לגולדה..."
                            disabled={isSending || isLoading}
                            className="
                                flex-1 bg-background border border-border rounded-xl
                                h-11 px-4 text-sm text-foreground
                                placeholder:text-muted-foreground
                                focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                                transition-all duration-200
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        />
                        <button
                            id="golda-modal-send"
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isSending || isLoading}
                            aria-label="שלח הודעה"
                            className="
                                w-11 h-11 rounded-xl shrink-0
                                bg-primary hover:bg-primary/90
                                text-primary-foreground
                                flex items-center justify-center
                                shadow-sm hover:shadow-md
                                transition-all duration-200
                                disabled:opacity-40 disabled:cursor-not-allowed
                                active:scale-95
                            "
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
                        Enter לשליחה • Escape לסגירה
                    </p>
                </div>
            </div>
        </div>
    );
}
