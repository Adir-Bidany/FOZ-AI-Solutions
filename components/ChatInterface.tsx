"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";

// הגדרת סוג המידע שהצ'אט מצפה לקבל
interface ChatProps {
    businessConfig: {
        businessName: string;
        ownerName: string;
        tone: string;
        domainGuidelines: string;
    };
}

export default function ChatInterface({ businessConfig }: ChatProps) {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `היי! אני העוזרת החכמה של ${businessConfig.businessName}. איך אפשר לעזור לך? ✨`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
                    businessConfig: businessConfig, // שימוש בהגדרות שהגיעו מבחוץ
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
                { role: "assistant", content: "אופס, תקלה רגעית. נסי שוב." },
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
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    <Image
                        src="/favicon.png"
                        alt="Logo"
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-right text-gray-900">
                        {businessConfig.businessName}
                    </h3>
                    <p className="text-xs text-green-500 flex items-center gap-1 font-medium">
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
                                        ? "bg-gray-900 text-white rounded-bl-none"
                                        : "bg-white border border-gray-100 text-gray-800 rounded-br-none"
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
                        placeholder="כתבי כאן..."
                        className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-purple-500 text-black text-right"
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="rounded-full bg-gray-900 hover:bg-gray-800 shrink-0 text-white transform rotate-180"
                        disabled={isLoading}
                    >
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
