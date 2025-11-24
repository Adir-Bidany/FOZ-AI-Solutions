"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, BarChart3, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardChatProps {
    businessConfig: any;
}

export default function DashboardChat({ businessConfig }: DashboardChatProps) {
    const [activePersona, setActivePersona] = useState<
        "receptionist" | "marketing" | "analyst"
    >("marketing");
    const [messages, setMessages] = useState<
        { role: string; content: string }[]
    >([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ניקוי הודעות והודעת פתיחה כשמחליפים עוזר
    useEffect(() => {
        const greetings = {
            receptionist: "היי, אני דניאלה. בודקת יומן?",
            marketing:
                "היי אהובה! בואי נרים את האינסטגרם. על מה בא לך לכתוב היום?",
            analyst: "שלום. אני רועי. מוכן לניתוח נתונים.",
        };
        setMessages([{ role: "assistant", content: greetings[activePersona] }]);
    }, [activePersona]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    businessConfig: businessConfig,
                    activePersona: activePersona, // <--- שולחים לשרת את הבחירה
                }),
            });

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply },
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* === Header: בחירת אנשי הצוות === */}
            <div className="bg-gray-50 p-2 flex gap-2 border-b overflow-x-auto">
                <button
                    onClick={() => setActivePersona("receptionist")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 ${
                        activePersona === "receptionist"
                            ? "bg-white shadow-sm text-blue-600 ring-1 ring-blue-100"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=daniella" />
                    </Avatar>
                    דניאלה (קבלה)
                </button>
                <button
                    onClick={() => setActivePersona("marketing")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 ${
                        activePersona === "marketing"
                            ? "bg-white shadow-sm text-pink-600 ring-1 ring-pink-100"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=michal" />
                    </Avatar>
                    מיכל (שיווק)
                </button>
                <button
                    onClick={() => setActivePersona("analyst")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 ${
                        activePersona === "analyst"
                            ? "bg-white shadow-sm text-green-600 ring-1 ring-green-100"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=roi" />
                    </Avatar>
                    רועי (כספים)
                </button>
            </div>

            {/* === אזור ההודעות === */}
            <ScrollArea className="flex-1 p-4 bg-slate-50/50">
                <div className="space-y-4">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                m.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            }`}
                        >
                            <div
                                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                    m.role === "user"
                                        ? "bg-gray-900 text-white rounded-bl-none"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-br-none"
                                }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <span className="bg-white px-3 py-2 rounded-full text-xs text-gray-400 border animate-pulse">
                                מקליד/ה...
                            </span>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* === אזור הקלדה === */}
            <div className="p-3 bg-white border-t">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={`דברי עם ${
                            activePersona === "marketing"
                                ? "מיכל"
                                : activePersona === "analyst"
                                ? "רועי"
                                : "דניאלה"
                        }...`}
                        className="rounded-full bg-gray-50 border-gray-200"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="rounded-full bg-gray-900 shrink-0"
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
