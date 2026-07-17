"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitialGreeting } from "@/actions/chat";

interface Message {
    role: "user" | "assistant" | "model";
    content: string;
}

interface UnifiedChatWidgetProps {
    mode: "public" | "admin";
    variant: "embedded" | "floating";
    businessConfig?: any;
    initialMessages?: Message[];
    className?: string;
    agentPersona?: string;
}

export default function UnifiedChatWidget({
    mode,
    variant,
    businessConfig,
    initialMessages = [],
    className,
    agentPersona,
}: UnifiedChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);

    // Reset state if business context shifts
    useEffect(() => {
        setSessionId(null);
        setMessages(initialMessages);
    }, [businessConfig?._id]);

    // Listen for global security purge events (cross-route boundaries)
    useEffect(() => {
        const handlePurge = () => {
            console.log("[UnifiedChatWidget] Security purge received. Wiping state.");
            setSessionId(null);
            setMessages(initialMessages);
        };
        window.addEventListener("security-purge", handlePurge);
        return () => window.removeEventListener("security-purge", handlePurge);
    }, [initialMessages]);

    // Fetch dynamic initial greeting if starting empty
    useEffect(() => {
        if (messages.length === 0 && agentPersona) {
            getInitialGreeting(agentPersona).then((greeting) => {
                if (greeting) {
                    setMessages([{ role: "assistant", content: greeting }]);
                }
            });
        }
    }, [agentPersona, messages.length]);

    const handleSend = async (content: string) => {
        // Add user message
        const userMsg: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const consumerDataStr = localStorage.getItem("foz_consumer_data");
            const consumerData = consumerDataStr ? JSON.parse(consumerDataStr) : null;
            const customerId = consumerData?.id || consumerData?._id || null;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content,
                    businessId: businessConfig?._id,
                    sessionId: sessionId,
                    agentPersona: agentPersona,
                    customerId: customerId,
                }),
            });

            const data = await response.json();

            if (data.response) {
                const aiMsg: Message = {
                    role: "assistant",
                    content: data.response,
                };
                setMessages((prev) => [...prev, aiMsg]);
                if (data.sessionId) {
                    setSessionId(data.sessionId);
                }
                
                // NEW: Intercept Auto-Logout
                if (data._system_action === "force_logout") {
                    window.dispatchEvent(new Event("consumer-force-logout"));
                }
            } else if (data.error) {
                console.error("API Error:", data.error);
                // Optional: Show error in chat
            }
        } catch (error) {
            console.error("Failed to send message", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    return (
        <div className={cn("flex flex-col overflow-hidden", className)}>
            {/* Header (Optional based on variant) */}
            {variant === "floating" && (
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                            🤖
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">בינה מלאכותית היא השותף החדש שלך</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-xs text-blue-100">מחובר 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent">
                {messages.map((msg, idx) => (
                    <ChatBubble
                        key={idx}
                        role={msg.role}
                        content={msg.content}
                        mode={mode}
                        avatarUrl={businessConfig?.logo}
                    />
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full animate-pulse">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2 text-xs text-gray-500">
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 pt-2">
                <ChatInput
                    onSend={handleSend}
                    isLoading={isLoading}
                    mode={mode}
                    placeholder={mode === "public" ? "שאל אותי כל דבר..." : "Type your message..."}
                />
            </div>
        </div>
    );
}
