"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatInterfaceProps {
    businessConfig: any;
}

export default function ChatInterface({ businessConfig }: ChatInterfaceProps) {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `היי! אני העוזרת החכמה של ${
                businessConfig.businessName || "העסק"
            }. איך אפשר לעזור לך להיראות מדהים היום? ✨`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

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
                    content: "סליחה, יש לי בעיה בתקשורת כרגע.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // בחירת הלוגו להציג בראש הצ'אט
    // אם יש לוגו ללקוח -> מציגים אותו. אם לא -> מציגים את הלוגו של FOZ כברירת מחדל
    const chatAvatar = businessConfig.logo || "/favicon.png";

    return (
        <div className="flex flex-col h-full bg-[#FDFCF8]" dir="rtl">
            {/* Header של הצ'אט */}
            <div className="bg-white p-3 flex items-center gap-3 border-b shadow-sm shrink-0 relative z-10">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                    <Image
                        src={chatAvatar}
                        alt="Avatar"
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    {/* שם העסק בראש הצ'אט */}
                    <h3 className="font-bold text-gray-900 text-sm">
                        {businessConfig.businessName}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                            מחוברת כעת
                        </span>
                    </div>
                </div>
            </div>

            {/* אזור ההודעות */}
            <ScrollArea className="flex-1 p-4 bg-[url('https://www.transparenttextures.com/patterns/snow.png')]">
                <div className="space-y-4 pb-2">
                    {messages.map((m, i) => (
                        <div
                            key={i}
                            className={`flex ${
                                m.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                            } animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            {/* תמונת הבוט ליד הודעה */}
                            {m.role === "assistant" && (
                                <div className="relative w-8 h-8 ml-2 mt-1 rounded-full overflow-hidden border border-purple-100 shrink-0">
                                    <Image
                                        src={chatAvatar}
                                        alt="Bot"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                    m.role === "user"
                                        ? "bg-purple-600 text-white rounded-br-none shadow-purple-200"
                                        : "bg-white border border-gray-100 text-gray-800 rounded-bl-none"
                                }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="relative w-8 h-8 ml-2 mt-1 rounded-full overflow-hidden border border-purple-100 shrink-0">
                                <Image
                                    src={chatAvatar}
                                    alt="Bot"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none text-xs text-gray-400 flex items-center gap-1 shadow-sm">
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
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* אזור הקלדה */}
            <div className="p-3 bg-white border-t relative z-10">
                <div className="relative flex items-center">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="כתבי כאן הודעה..."
                        disabled={isLoading}
                        className={`pr-4 pl-12 py-6 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-purple-500 focus-visible:ring-2 transition-all duration-300 text-[15px] placeholder:text-gray-500 placeholder:font-medium 
              ${
                  !isFocused && !input
                      ? "animate-inviting-pulse placeholder:animate-pulse placeholder:text-purple-400"
                      : "placeholder:text-gray-400"
              }
            `}
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className={`absolute left-1.5 h-9 w-9 rounded-full transition-all duration-300 ${
                            input.trim()
                                ? "bg-purple-600 hover:bg-purple-700 scale-100"
                                : "bg-gray-200 text-gray-400 scale-90"
                        }`}
                    >
                        <Send
                            size={16}
                            className={input.trim() ? "ml-0.5" : ""}
                        />
                    </Button>
                </div>
            </div>
        </div>
    );
}
