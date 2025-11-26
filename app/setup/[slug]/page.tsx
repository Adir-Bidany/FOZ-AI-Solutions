"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Send,
    Sparkles,
    UploadCloud,
    Info,
    Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// --- רכיב תוכן ההדרכה (כדי שלא נשכפל קוד) ---
const InstructionsContent = () => (
    <div className="space-y-6 text-sm leading-relaxed" dir="rtl">
        <p className="text-gray-600">
            אנחנו מקימים את ה"מוח" של העוזרת שלך. כדי שהיא תדע למכור עבורך, היא
            צריכה להבין את העסק.
        </p>
        <ul className="space-y-4">
            <li className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    1
                </span>
                <span className="text-gray-700">
                    ספרי לה על <strong>הטיפולים הכי רווחיים</strong> שלך ומה
                    המחירים שלהם.
                </span>
            </li>
            <li className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                </span>
                <span className="text-gray-700">
                    הגדירי את <strong>שעות הפעילות</strong> המדויקות שלך.
                </span>
            </li>
            <li className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    3
                </span>
                <span className="text-gray-700">
                    יש חוקים מיוחדים? (למשל: פיקדון לתור, הגעה עם מסכה).
                </span>
            </li>
        </ul>
        <div className="mt-4 p-3 bg-purple-50 text-purple-800 rounded-lg text-xs border border-purple-100">
            💡 <strong>טיפ:</strong> דברי איתה חופשי, כמו שאת מדברת לעובדת חדשה.
            היא מבינה הכל.
        </div>
    </div>
);

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

        if (file.size > 1024 * 1024) {
            toast.error("התמונה גדולה מדי. אנא בחרי תמונה עד 1MB.");
            return;
        }

        setIsUploading(true);

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setLogoPreview(base64);

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

    // קומפוננטת העלאת לוגו (לשימוש חוזר גם בדיאלוג וגם בצד ימין)
    const LogoUploader = () => (
        <div className="flex flex-col gap-4">
            <div
                className="border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors relative overflow-hidden group min-h-[150px]"
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
                        <p className="text-sm text-gray-500 font-medium text-center">
                            לחצי להעלאת לוגו
                        </p>
                        <p className="text-xs text-gray-400 mt-1 text-center">
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
                <p className="text-xs text-purple-600 text-center animate-pulse">
                    מעלה תמונה...
                </p>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-50 flex flex-col lg:p-8" dir="rtl">
            
            {/* === כפתור צף להנחיות ולוגו (מובייל בלבד) === */}
            {/* זה החלק החדש שמשלב גם לוגו וגם הוראות */}
            <div className="lg:hidden fixed left-4 top-20 z-40">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button 
                            className="rounded-full w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl hover:scale-105 transition-all border-2 border-white/20"
                            size="icon"
                        >
                            <Info size={24} />
                        </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                הגדרות העסק
                            </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-2">
                            {/* חלק 1: העלאת לוגו */}
                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                    <UploadCloud size={16} className="text-purple-600" /> 
                                    הלוגו שלך
                                </h3>
                                <LogoUploader />
                            </div>

                            <div className="h-px bg-gray-100" />

                            {/* חלק 2: ההדרכה */}
                            <div>
                                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                                    <Info size={16} className="text-purple-600" /> 
                                    מה עושים עכשיו?
                                </h3>
                                <InstructionsContent />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* === גריד ראשי === */}
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full lg:h-[85vh] self-center">
                
                {/* === צד ימין: מרכז הבקרה (מוסתר במובייל) === */}
                <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 h-full overflow-y-auto">
                    <Card className="p-6 bg-white shadow-sm border-purple-100">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <UploadCloud size={18} className="text-purple-600" /> הלוגו שלך
                        </h3>
                        <LogoUploader />
                    </Card>

                    <Card className="p-6 bg-white shadow-lg flex-1 border border-gray-100">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                            <Info size={20} className="text-purple-600" /> מה עושים עכשיו?
                        </h3>
                        <InstructionsContent />
                    </Card>
                </div>

                {/* === צד שמאל: הצ'אט === */}
                <div className="col-span-1 lg:col-span-8 bg-white lg:rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full w-full">
                    {/* Header הצ'אט */}
                    <div className="bg-white p-3 md:p-4 border-b flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 text-sm md:text-base">
                                    ראיון הקמה
                                </h2>
                                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>{" "}
                                    מחוברת
                                </p>
                            </div>
                        </div>
                        
                        {/* שינוי: מחקתי מכאן את הכפתור הישן שהיה ב-Header */}
                    </div>

                    {/* גוף הצ'אט */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 custom-scrollbar">
                        <div className="space-y-4 md:space-y-6 pb-4">
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
                                        className={`max-w-[85%] md:max-w-[80%] p-3 md:p-4 rounded-2xl text-sm shadow-sm leading-relaxed ${
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
                    <div className="p-3 md:p-4 bg-white border-t shrink-0 pb-safe">
                        <div className="flex gap-2 md:gap-3 relative">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="כתבי כאן..."
                                className="rounded-full pl-12 h-11 md:h-12 bg-gray-50 border-gray-200 focus-visible:ring-purple-500 text-sm md:text-base"
                                autoFocus
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                size="icon"
                                className="absolute left-1 top-1 h-9 w-9 md:h-10 md:w-10 rounded-full bg-purple-600 hover:bg-purple-700 shadow-md transition-all"
                                disabled={isLoading}
                            >
                                <Send size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

