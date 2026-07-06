"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchInternalChat, sendInternalMessage } from "@/actions/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, TrendingUp, DollarSign, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AgentRoomProps {
    businessId: string;
}

export default function AgentRoom({ businessId }: AgentRoomProps) {
    const [activeTab, setActiveTab] = useState("golda");
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Chat Input State
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadChat(activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
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
        setMessages(prev => [...prev, TEMP_MSG]);
        setInputValue("");
        setIsSending(true);

        try {
            const updatedHistory = await sendInternalMessage(businessId, activeTab, TEMP_MSG.parts[0].text);
            setMessages(updatedHistory);
        } catch (e) {
            console.error(e);
            // Optionally revert or show error
        } finally {
            setIsSending(false);
        }
    };

    const agents = {
        golda: { name: "גולדה", role: "מנהלת קליניקה", color: "text-purple-600", bg: "bg-purple-100", icon: Sparkles },
        michal: { name: "מיכל", role: "שיווק ומכירות", color: "text-pink-600", bg: "bg-pink-100", icon: TrendingUp },
        roi: { name: "רועי", role: "פיננסים", color: "text-blue-600", bg: "bg-blue-100", icon: DollarSign },
    };

    const currentAgent = agents[activeTab as keyof typeof agents];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px] xl:h-full">
            {/* Header & Tabs */}
            <div className="p-6 border-b border-gray-50 bg-white shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Sparkles size={18} />
                    </div>
                    חדר המצב (Agent Room)
                </h2>

                <Tabs defaultValue="golda" onValueChange={setActiveTab} className="w-full" dir="rtl">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-xl">
                        {Object.entries(agents).map(([key, agent]) => (
                            <TabsTrigger
                                key={key}
                                value={key}
                                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <agent.icon size={16} className={agent.color} />
                                    <span className="font-medium">{agent.name}</span>
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50/50 p-4 overflow-hidden relative flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4 pb-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40 text-gray-400">
                                טוען היסטוריה...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2 mt-10">
                                <div className={`w-12 h-12 rounded-full ${currentAgent.bg} flex items-center justify-center`}>
                                    <currentAgent.icon size={20} className={currentAgent.color} />
                                </div>
                                <p>עדיין אין הודעות עם {currentAgent.name}.</p>
                                <p className="text-xs">התחילי שיחה כדי לקבל עזרה וייעוץ.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm leading-relaxed ${msg.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                                            }`}
                                    >
                                        {msg.parts[0].text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

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
