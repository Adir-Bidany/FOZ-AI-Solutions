"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchInternalChat, sendInternalMessage } from "@/actions/dashboard";
import { Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AgentRoomProps {
    businessId: string;
}

export default function AgentRoom({ businessId }: AgentRoomProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Chat Input State
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
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
        <div className={`bg-white rounded-3xl overflow-hidden flex flex-col h-[600px] xl:h-full transition-all duration-500 ${getModeStyles(lastMessageMode)}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-white shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 mb-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentAgent.bg} ${currentAgent.color}`}>
                        <Sparkles size={18} />
                    </div>
                    חדר המצב (Agent Room)
                </h2>
                <p className="text-sm text-gray-500 mr-10">גולדה - רמטכ"לית, שיווק ופיננסים</p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50/50 p-4 overflow-hidden relative flex flex-col">
                <div
                    ref={scrollContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto pr-4 custom-scrollbar"
                >
                    <div className="space-y-4 pb-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40 text-gray-400">
                                טוען היסטוריה...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2 mt-10">
                                <div
                                    className={`w-12 h-12 rounded-full ${currentAgent.bg} flex items-center justify-center`}
                                >
                                    <currentAgent.icon
                                        size={20}
                                        className={currentAgent.color}
                                    />
                                </div>
                                <p>עדיין אין הודעות עם {currentAgent.name}.</p>
                                <p className="text-xs">
                                    התחילי שיחה כדי לקבל עזרה וייעוץ.
                                </p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                                        }`}
                                    >
                                        {msg.parts[0].text}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Input Area - ALWAYS VISIBLE */}
                <div className="pt-4 border-t border-gray-100 bg-transparent shrink-0">
                    <div className="relative flex items-center gap-2">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder={`כתבי כאן ל${currentAgent.name}...`}
                            className="bg-white border-gray-200 focus-visible:ring-indigo-500 rounded-xl h-11 pr-4 pl-12 shadow-sm"
                            disabled={isSending}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isSending}
                            size="icon"
                            className="absolute left-1 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
                        >
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
