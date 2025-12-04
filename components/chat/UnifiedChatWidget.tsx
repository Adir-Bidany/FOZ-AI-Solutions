"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

export default function UnifiedChatWidget({
    mode,
    variant,
    businessConfig,
    initialMessages = [],
    className,
}: UnifiedChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleSend = async (content: string) => {
        // Add user message
        const userMsg: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content,
                    businessId: businessConfig?._id,
                    sessionId: sessionId,
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
                            <h3 className="font-bold text-sm">AI Assistant</h3>
                            <p className="text-xs text-blue-100">Online</p>
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
