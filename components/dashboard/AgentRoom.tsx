"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchInternalChat, sendInternalMessage, archiveCurrentSession } from "@/actions/dashboard";
import { Sparkles, Send, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function parseCleanText(rawText: string): string {
    if (!rawText) return "";
    const trimmed = rawText.trim();
    if (trimmed.startsWith("{") && trimmed.includes('"reply"')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed.reply) return parsed.reply;
        } catch (_) {
            const match = trimmed.match(/"reply"\s*:\s*"([\s\S]*?)"\s*,?\s*"(?:active_mode|mode)"/);
            if (match && match[1]) return match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
        }
    }
    return rawText;
}

interface AgentRoomProps {
    businessId: string;
}

export default function AgentRoom({ businessId }: AgentRoomProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Chat Input State
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChat("golda");
    }, []);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const loadChat = async (persona: string) => {
        setIsLoading(true);
        const msgs = await fetchInternalChat(businessId, persona);
        setMessages(msgs);
        setIsLoading(false);
    };

    const handleNewChat = async () => {
        if (isLoading || isSending || isArchiving) return;
        setIsArchiving(true);
        try {
            await archiveCurrentSession(businessId, "golda");
            await loadChat("golda");
        } catch (e) {
            console.error("Failed to archive chat session:", e);
        } finally {
            setIsArchiving(false);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return;

        const TEMP_MSG = { role: "user", parts: [{ text: inputValue }] };
        setMessages((prev) => [...prev, TEMP_MSG]);
        setInputValue("");
        setIsSending(true);

        try {
            const updatedHistory = await sendInternalMessage(
                businessId,
                "golda",
                TEMP_MSG.parts[0].text,
            );
            setMessages(updatedHistory);
        } catch (e) {
            console.error(e);
            // Optionally revert or show error
        } finally {
            setIsSending(false);
        }
    };

    const currentAgent = {
        name: "גולדה",
        role: "מנהלת עסק",
        color: "text-purple-600",
        bg: "bg-purple-100",
        icon: Sparkles,
    };

    const lastMessageMode = messages.length > 0 && messages[messages.length - 1].role === "model" 
        ? messages[messages.length - 1].parts[0]?.mode 
        : "core";

    const getModeStyles = (mode: string | undefined) => {
        switch (mode) {
            case "marketing":
                return "border-2 border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.6)]";
            case "analytics":
                return "border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]";
            default:
                return "border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]";
        }
    };

    return (
        <div className={`bg-card/90 backdrop-blur-md rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(255,255,255,0.35)] border border-border/60 dark:border-white/10 overflow-hidden flex flex-col h-[450px] md:h-[500px] max-w-3xl w-full mx-auto transition-all duration-500 ${getModeStyles(lastMessageMode)}`}>
            {/* Header */}
            <div className="p-6 border-b border-border/40 bg-transparent shrink-0 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-1">
                       גולדה
                    </h2>
                   
                </div>

                <Button
                    onClick={handleNewChat}
                    disabled={isLoading || isSending || isArchiving}
                    variant="outline"
                    size="sm"
                    className="gap-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 border-border"
                    title="שמירת השיחה הנוכחית ופתיחת שיחה חדשה"
                >
                    <RotateCcw size={14} className={isArchiving ? "animate-spin" : ""} /> שיחה חדשה
                </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-muted/30 p-4 overflow-hidden relative flex flex-col">
                <div
                    ref={scrollContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto pe-4 custom-scrollbar"
                >
                    <div className="space-y-4 pb-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40 text-muted-foreground">
                                טוען היסטוריה...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex items-center justify-center h-40 text-muted-foreground text-center">
                                <p className="text-sm font-medium">
                                    התחיל/י שיחה כדי לקבל עזרה וייעוץ
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isUser = msg.role === "user";
                                return (
                                    <div
                                        key={idx}
                                        className={`flex w-full gap-2.5 items-start ${isUser ? "justify-start" : "justify-end"}`}
                                        dir="rtl"
                                    >
                                        {/* Avatar Logo on the RIGHT side of the bubble */}
                                        <Avatar className={`w-8 h-8 mt-0.5 shrink-0 bg-background overflow-hidden ${
                                            isUser
                                                ? "border-2 border-blue-500 ring-2 ring-blue-500/30"
                                                : "border-2 border-yellow-400 ring-2 ring-yellow-400/30"
                                        }`}>
                                            <AvatarImage src="/logo.png" className="object-cover" />
                                            <AvatarFallback className={`font-bold text-xs ${isUser ? "bg-blue-500/10 text-blue-500" : "bg-yellow-400/10 text-yellow-600"}`}>
                                                {isUser ? "U" : "ג"}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Message Bubble */}
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                                                isUser
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-card border border-border text-foreground rounded-tl-sm"
                                            }`}
                                        >
                                            {parseCleanText(msg.parts[0].text)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Input Area - ALWAYS VISIBLE */}
                <div className="pt-4 border-t border-border bg-transparent shrink-0">
                    <div className="relative flex items-center gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={`כתבי כאן ל${currentAgent.name}...`}
                            className="bg-card border-border focus-visible:ring-ring rounded-xl h-11 pe-4 ps-12 shadow-sm"
                            disabled={isSending}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isSending}
                            size="icon"
                            className="absolute start-1 w-9 h-9 bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all"
                        >
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
