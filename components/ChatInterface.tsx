"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";

export default function ChatInterface() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "היי! אני העוזרת החכמה של הקליניקה. איך אפשר לעזור לך להיראות מדהים היום? ✨",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // גלילה אוטומטית למטה
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
                    businessConfig: {
                        businessName: "FOZ Clinic",
                        ownerName: "ד״ר כהן",
                        tone: "יוקרתי, נעים ומקצועי",
                        domainGuidelines:
                            "קליניקה לאסתטיקה רפואית. טיפולי בוטוקס, חומצה היאלרונית ופיסול פנים.",
                    },
                }),
            });

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply },
            ]);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "אופס, הייתה תקלה קטנה. נסי שוב עוד רגע.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="flex flex-col h-full bg-white text-gray-800 overflow-hidden relative"
            dir="rtl"
        >
            {/* כותרת הצ'אט */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-b flex items-center gap-3 sticky top-0 z-10 shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-right">
                        FOZ Assistant
                    </h3>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        מחוברת כעת
                    </p>
                </div>
            </div>

            {/* אזור ההודעות */}
            <ScrollArea className="flex-1 p-4 bg-gray-50 h-[400px]">
                <div className="space-y-4 pb-4">
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
                                dir="rtl"
                                className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm text-right leading-relaxed ${
                                    m.role === "user"
                                        ? "bg-gray-900 text-white rounded-bl-none" // בועה שחורה למשתמש
                                        : "bg-white border border-gray-100 text-gray-800 rounded-br-none" // בועה לבנה לבוט
                                }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-br-none text-xs text-gray-400 flex items-center gap-1">
                                <span className="animate-bounce">●</span>
                                <span className="animate-bounce delay-100">
                                    ●
                                </span>
                                <span className="animate-bounce delay-200">
                                    ●
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-1" />
                </div>
            </ScrollArea>

            {/* אזור ההקלדה */}
            <div className="p-3 bg-white border-t mt-auto shrink-0">
                <div className="flex gap-2" dir="rtl">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="כתבי כאן הודעה..."
                        className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-purple-500 text-black text-right"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="rounded-full bg-gray-900 hover:bg-gray-800 shrink-0 text-white transform rotate-180" // הפכתי את אייקון השליחה שיתאים לעברית
                        disabled={isLoading}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
