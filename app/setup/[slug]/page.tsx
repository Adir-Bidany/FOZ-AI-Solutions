"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function SetupPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const [resolvedParams, setResolvedParams] = useState<{
        slug: string;
    } | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const initChat = async () => {
            const p = await params;
            setResolvedParams(p);
            try {
                const res = await fetch("/api/setup/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug: p.slug, messages: [] }),
                });
                const data = await res.json();
                setMessages([{ role: "assistant", content: data.reply }]);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        initChat();
    }, [params]);

    // תיקון גלילה: שימוש ב-scrollTo של האלמנט
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !resolvedParams) return;
        const userMessage = { role: "user", content: input };
        const newHistory = [...messages, userMessage];
        setMessages(newHistory);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/setup/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug: resolvedParams.slug,
                    messages: newHistory,
                }),
            });
            const data = await res.json();

            if (data.isFinished) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content:
                            "תודה רבה! קיבלתי את כל המידע. אני מקים את הדשבורד שלך... 🚀",
                    },
                ]);
                setTimeout(() => {
                    router.push(`/dashboard/${resolvedParams.slug}`);
                }, 3000);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.reply },
                ]);
            }
        } catch (error) {
            toast.error("תקלה בתקשורת");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
            dir="rtl"
        >
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-[80vh] flex flex-col">
                <div className="bg-purple-600 p-4 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h1 className="text-lg font-bold flex items-center gap-2">
                            <Sparkles size={18} /> הגדרת העסק החכם
                        </h1>
                    </div>
                </div>

                {/* התיקון לגלילה: הוספת h-full ל-ScrollArea ושימוש נכון ב-viewport */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
                    <div className="space-y-6 pb-4">
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
                                    className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                        m.role === "user"
                                            ? "bg-purple-600 text-white rounded-br-none text-right"
                                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-none text-right" // הוספתי text-right
                                    }`}
                                >
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl text-xs text-gray-400">
                                    מקלידה...
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </div>

                <div className="p-4 bg-white border-t shrink-0">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="עני כאן..."
                            className="rounded-full"
                            autoFocus
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            size="icon"
                            className="rounded-full bg-purple-600"
                            disabled={isLoading}
                        >
                            <Send size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
