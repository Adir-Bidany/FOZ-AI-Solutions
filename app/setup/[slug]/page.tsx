"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Send,
    Sparkles,
    UploadCloud,
    CheckCircle2,
    Info,
    ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

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

    // לוגו וסטטוס
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // אתחול הצ'אט
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

    // גלילה
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
                behavior: "smooth",
                block: "end",
            });
        }
    }, [messages]);

    // פונקציה להעלאת לוגו
    const handleLogoUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file || !resolvedParams) return;

        // הגבלת גודל (עד 1MB כדי לא להכביד על ה-DB)
        if (file.size > 1024 * 1024) {
            toast.error("התמונה גדולה מדי. אנא בחרי תמונה עד 1MB.");
            return;
        }

        setIsUploading(true);

        // המרה ל-Base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setLogoPreview(base64); // תצוגה מקדימה מידית

            // שליחה לשרת
            try {
                await fetch("/api/setup/upload-logo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        slug: resolvedParams.slug,
                        logoBase64: base64,
                    }),
                });
                toast.success("הלוגו נשמר בהצלחה!");
            } catch (error) {
                toast.error("שגיאה בשמירת הלוגו");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    // שליחת הודעה לצ'אט
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
            className="min-h-screen bg-gray-50 p-4 lg:p-8 flex items-center justify-center"
            dir="rtl"
        >
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 h-[85vh]">
                {/* === צד ימין: מרכז הבקרה והמידע === */}
                <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                    {/* כרטיס לוגו */}
                    <Card className="p-6 bg-white shadow-sm border-purple-100">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <UploadCloud
                                size={18}
                                className="text-purple-600"
                            />{" "}
                            הלוגו שלך
                        </h3>

                        <div
                            className="border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors relative overflow-hidden group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {logoPreview ? (
                                <div className="relative w-full h-32">
                                    <Image
                                        src={logoPreview}
                                        alt="Logo Preview"
                                        fill
                                        className="object-contain"
                                    />
                                    <div className="absolute inset-0 bg-black/20 hidden group-hover:flex items-center justify-center text-white text-xs font-medium rounded-xl">
                                        לחצי להחלפה
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-sm text-gray-500 font-medium">
                                        לחצי להעלאת לוגו
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        מומלץ: PNG שקוף
                                    </p>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                        </div>
                        {isUploading && (
                            <p className="text-xs text-purple-600 mt-2 text-center animate-pulse">
                                מעלה תמונה...
                            </p>
                        )}
                    </Card>

                    {/* כרטיס הדרכה */}
                    <Card className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg flex-1">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Info size={20} className="text-purple-400" /> מה
                            עושים עכשיו?
                        </h3>
                        <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
                            <p>
                                אנחנו מקימים את ה"מוח" של העוזרת שלך. כדי שהיא
                                תדע למכור עבורך, היא צריכה להבין את העסק.
                            </p>

                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                                        1
                                    </span>
                                    <p>
                                        ספרי לה על הטיפולים הכי רווחיים שלך ומה
                                        המחירים שלהם.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                                        2
                                    </span>
                                    <p>הגדירי את שעות הפעילות המדויקות שלך.</p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                                        3
                                    </span>
                                    <p>
                                        יש חוקים מיוחדים? (למשל: פיקדון לתור,
                                        הגעה עם מסכה).
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 p-3 bg-white/10 rounded-lg border border-white/10 text-xs">
                                💡 <strong>טיפ:</strong> דברי איתה חופשי, כמו
                                שאת מדברת לעובדת חדשה. היא מבינה הכל.
                            </div>
                        </div>
                    </Card>
                </div>

                {/* === צד שמאל: הצ'אט === */}
                <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden h-full">
                    {/* Header הצ'אט */}
                    <div className="bg-white p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">
                                    ראיון הקמה
                                </h2>
                                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                                    מחוברת
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* גוף הצ'אט */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar">
                        <div className="space-y-6">
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
                                        className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
                                            m.role === "user"
                                                ? "bg-gray-900 text-white rounded-br-none"
                                                : "bg-white border border-gray-200 text-gray-800 rounded-bl-none text-right"
                                        }`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none text-xs text-gray-400 shadow-sm flex items-center gap-2">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        מקלידה...
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    </div>

                    {/* אזור הקלדה */}
                    <div className="p-4 bg-white border-t">
                        <div className="flex gap-3 relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSend()
                                }
                                placeholder="כתבי את התשובה שלך כאן..."
                                className="rounded-full pl-12 h-12 bg-gray-50 border-gray-200 focus-visible:ring-purple-500"
                                autoFocus
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                size="icon"
                                className="absolute left-1 top-1 h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 shadow-md transition-all"
                                disabled={isLoading}
                            >
                                <Send size={18} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
