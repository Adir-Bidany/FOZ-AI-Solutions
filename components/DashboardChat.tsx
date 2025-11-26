"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation"; // הכרחי לרענון הדף

interface DashboardChatProps {
    businessConfig: any;
}

export default function DashboardChat({ businessConfig }: DashboardChatProps) {
    const router = useRouter(); // הוק לניהול הניווט והרענון
    const [activePersona, setActivePersona] = useState<
        "receptionist" | "marketing" | "analyst"
    >("receptionist"); // ברירת מחדל: דניאלה

    const [messages, setMessages] = useState<
        { role: string; content: string }[]
    >([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ניקוי הודעות והודעת פתיחה כשמחליפים עוזר
    useEffect(() => {
        const greetings = {
            receptionist: `היי ${
                businessConfig.ownerName.split(" ")[0]
            }, אני דניאלה. אני כאן לנהל את היומן וההגדרות. מה תרצי לעשות?`,
            marketing:
                "היי אהובה! בואי נרים את האינסטגרם. על מה בא לך לכתוב היום?",
            analyst: "שלום. אני רועי. מוכן לניתוח נתונים פיננסיים.",
        };
        setMessages([{ role: "assistant", content: greetings[activePersona] }]);
    }, [activePersona, businessConfig.ownerName]);

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
                    businessConfig: businessConfig,
                    activePersona: activePersona,
                }),
            });

            const data = await response.json();

            // --- התוספת הקריטית: רענון הממשק ---
            // אם דניאלה ביצעה שינוי בהגדרות (כמו שם עסק), נרענן את הדף כדי שהלקוחה תראה את השינוי מיד
            if (
                data.reply.includes("עודכנו") ||
                data.reply.includes("שונה") ||
                data.reply.includes("בוצע שינוי")
            ) {
                console.log("Refreshing UI due to business update...");
                router.refresh(); // הפקודה שמרעננת את ה-Server Components
            }
            // -------------------------------------

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
                    content: "אופס, הייתה תקלה בתקשורת. נסי שוב.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* === Header: בחירת אנשי הצוות === */}
            <div className="bg-gray-50 p-2 flex gap-2 border-b overflow-x-auto shrink-0">
                <button
                    onClick={() => setActivePersona("receptionist")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 whitespace-nowrap ${
                        activePersona === "receptionist"
                            ? "bg-white shadow-sm text-blue-600 ring-1 ring-blue-100"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=daniella" />
                        <AvatarFallback>ד</AvatarFallback>
                    </Avatar>
                    דניאלה (תפעול)
                </button>
                <button
                    onClick={() => setActivePersona("marketing")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 whitespace-nowrap ${
                        activePersona === "marketing"
                            ? "bg-white shadow-sm text-pink-600 ring-1 ring-pink-100"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=michal" />
                        <AvatarFallback>מ</AvatarFallback>
                    </Avatar>
                    מיכל (שיווק)
                </button>
                <button
                    onClick={() => setActivePersona("analyst")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 whitespace-nowrap ${
                        activePersona === "analyst"
                            ? "bg-white shadow-sm text-green-600 ring-1 ring-green-100"
                            : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                    <Avatar className="w-6 h-6">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=roi" />
                        <AvatarFallback>ר</AvatarFallback>
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
                                className={`flex gap-3 max-w-[85%] ${
                                    m.role === "user"
                                        ? "flex-row-reverse"
                                        : "flex-row"
                                }`}
                            >
                                {/* אווטאר ליד ההודעה */}
                                {m.role !== "user" && (
                                    <Avatar className="w-8 h-8 mt-1 border border-white shadow-sm">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                                                activePersona === "receptionist"
                                                    ? "daniella"
                                                    : activePersona ===
                                                      "marketing"
                                                    ? "michal"
                                                    : "roi"
                                            }`}
                                        />
                                    </Avatar>
                                )}

                                <div
                                    className={`p-3 rounded-2xl text-sm shadow-sm leading-relaxed whitespace-pre-wrap ${
                                        m.role === "user"
                                            ? "bg-gray-900 text-white rounded-tl-none"
                                            : "bg-white border border-gray-200 text-gray-800 rounded-tr-none"
                                    }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <span className="bg-white px-3 py-2 rounded-full text-xs text-gray-400 border animate-pulse shadow-sm">
                                מקליד/ה...
                            </span>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* === אזור הקלדה === */}
            <div className="p-3 bg-white border-t shrink-0">
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
                        className="rounded-full bg-gray-50 border-gray-200 focus-visible:ring-offset-0"
                        disabled={isLoading}
                    />
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="rounded-full bg-gray-900 shrink-0 hover:bg-gray-800 transition-colors"
                        disabled={isLoading || !input.trim()}
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
