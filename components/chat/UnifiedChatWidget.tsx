"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitialGreeting } from "@/actions/chat";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { he } from "date-fns/locale";

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
    const [widgetType, setWidgetType] = useState<"date_picker" | "service_selector" | "confirmation" | null>(null);
    const [showCustomNote, setShowCustomNote] = useState(false);
    const [customNoteText, setCustomNoteText] = useState("");

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
                
                if (data._system_action === "force_logout") {
                    window.dispatchEvent(new Event("consumer-force-logout"));
                } else if (data._system_action === "show_date_picker") {
                    setWidgetType("date_picker");
                } else if (data._system_action === "show_services") {
                    setWidgetType("service_selector");
                } else if (data._system_action === "show_confirmation") {
                    setWidgetType("confirmation");
                } else {
                    setWidgetType(null);
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
        if (scrollRef.current && scrollRef.current.parentElement) {
            const container = scrollRef.current.parentElement;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages]);

    return (
        <div className={cn("flex flex-col overflow-hidden", className)}>
            {/* Header (Optional based on variant) */}
            {variant === "floating" && (
                <div className="p-4 bg-zinc-900 dark:bg-zinc-950 text-white border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl border border-zinc-700">
                            🤖
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">בינה מלאכותית היא השותף החדש שלך</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-xs text-zinc-300">מחובר 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent min-h-0">
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
                        <div className="bg-muted rounded-2xl px-4 py-2 text-xs text-muted-foreground">
                            Thinking...
                        </div>
                    </div>
                )}
                
                {/* Dynamic Widgets */}
                {widgetType === "date_picker" && (
                    <div className="bg-card/95 rounded-3xl shadow-lg border border-border/40 p-4 animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="text-sm font-bold text-center mb-2">בחירת תאריך</h4>
                        <div className="flex justify-center" dir="rtl">
                            <DayPicker 
                                mode="single" 
                                locale={he}
                                onSelect={(date) => {
                                    if (date) {
                                        setWidgetType(null);
                                        const dateStr = format(date, "yyyy-MM-dd");
                                        handleSend(`אשמח לבדוק תורים לתאריך ${dateStr}`);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {widgetType === "service_selector" && (
                    <div className="bg-card rounded-3xl shadow-lg border border-border/40 p-4 animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="text-sm font-bold mb-3">איזה טיפול תרצי לבדוק?</h4>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setWidgetType(null); handleSend("בוטוקס"); }} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">בוטוקס</button>
                            <button onClick={() => { setWidgetType(null); handleSend("טיפול חומצה היאלורונית"); }} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">חומצה היאלורונית</button>
                            <button onClick={() => { setWidgetType(null); handleSend("ייעוץ"); }} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">ייעוץ</button>
                            <button onClick={() => setShowCustomNote(true)} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm font-medium hover:bg-accent transition-colors">אחר</button>
                        </div>
                        {showCustomNote && (
                            <div className="mt-3 space-y-2">
                                <textarea 
                                    className="w-full text-sm p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="אנא פרטי (עד 50 מילים)..."
                                    rows={2}
                                    value={customNoteText}
                                    onChange={(e) => setCustomNoteText(e.target.value)}
                                />
                                <button 
                                    onClick={() => {
                                        setWidgetType(null);
                                        setShowCustomNote(false);
                                        handleSend(`טיפול אחר. הערה: ${customNoteText}`);
                                        setCustomNoteText("");
                                    }}
                                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold"
                                >
                                    שלח והמשך
                                </button>
                            </div>
                        )}
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
