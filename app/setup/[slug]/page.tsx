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
    ArrowLeft,
    SkipForward,
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

// --- רכיב תוכן ההדרכה ---
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
        </ul>
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
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    // פונקציית העלאת לוגו
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

    // --- הפונקציה החדשה: דילוג על השלב ---
    const handleSkip = () => {
        if (!resolvedParams) return;
        toast.info("מדלגים על הראיון... מעבירים אותך לדשבורד");
        setTimeout(() => {
            router.push(`/dashboard/${resolvedParams.slug}`);
        }, 1500);
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
                        content: "תודה רבה! סיימנו. מעבירה אותך לדשבורד...",
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

    // --- רכיב בחירת מנהל ---
    const ManagerPersonaSelector = ({ slug }: { slug: string }) => {
        const [gender, setGender] = useState<"female" | "male">("female");
        const [name, setName] = useState("Golda");
        const [isSaving, setIsSaving] = useState(false);

        // Update name default when gender changes, unless user edited it? 
        // For simplicity, we'll just reset name to default if gender changes.
        const handleGenderChange = (newGender: "female" | "male") => {
            setGender(newGender);
            setName(newGender === "female" ? "Golda" : "David");
        };

        const handleSave = async () => {
            if (!slug) return;
            setIsSaving(true);
            try {
                await fetch("/api/setup/update-manager", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug, managerGender: gender, managerName: name }),
                });
                toast.success("הגדרות המנהל נשמרו!");
            } catch (error) {
                toast.error("שגיאה בשמירה");
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="space-y-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => handleGenderChange("female")}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gender === "female"
                                ? "border-purple-600 bg-purple-50 text-purple-700"
                                : "border-gray-100 hover:border-gray-200 text-gray-500"
                            }`}
                    >
                        <div className="text-2xl">👩‍💼</div>
                        <span className="font-bold text-sm">גולדה</span>
                        <span className="text-[10px] opacity-80">קשוחה ומגוננת</span>
                    </button>
                    <button
                        onClick={() => handleGenderChange("male")}
                        className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gender === "male"
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-gray-100 hover:border-gray-200 text-gray-500"
                            }`}
                    >
                        <div className="text-2xl">👨‍💼</div>
                        <span className="font-bold text-sm">דוד</span>
                        <span className="text-[10px] opacity-80">טקטי ותכליתי</span>
                    </button>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">שם המנהל/ת:</label>
                    <div className="flex gap-2">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-9 text-sm"
                        />
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isSaving}
                            className={gender === "female" ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"}
                        >
                            {isSaving ? "..." : "שמור"}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-gray-50 flex flex-col lg:p-8 overflow-hidden"
            dir="rtl"
        >
            {/* כפתור מידע במובייל */}
            <div className="lg:hidden fixed left-4 top-4 z-50">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            className="rounded-full w-10 h-10 bg-white text-gray-700 shadow-md border"
                            size="icon"
                        >
                            <Info size={20} />
                        </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl">
                        <DialogHeader>
                            <DialogTitle>הגדרות</DialogTitle>
                        </DialogHeader>
                        <LogoUploader />
                        <InstructionsContent />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full lg:h-[85vh] self-center">
                {/* צד ימין: לוגו, מנהל והנחיות */}
                <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 h-full overflow-hidden">
                    <Card className="p-6 bg-white shadow-sm border-purple-100 shrink-0">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <UploadCloud
                                size={18}
                                className="text-purple-600"
                            />{" "}
                            הלוגו שלך
                        </h3>
                        <LogoUploader />
                    </Card>

                    {/* --- Manager Persona Selector --- */}
                    <Card className="p-6 bg-white shadow-sm border-purple-100 shrink-0">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-purple-600" />
                            המנהל הדיגיטלי שלך
                        </h3>
                        <ManagerPersonaSelector slug={resolvedParams?.slug || ""} />
                    </Card>

                    <Card className="p-6 bg-white shadow-lg flex-1 border border-gray-100 overflow-y-auto">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                            <Info size={20} className="text-purple-600" />{" "}
                            הוראות
                        </h3>
                        <InstructionsContent />
                    </Card>
                </div>

                {/* צד שמאל: הצ'אט */}
                {/* כאן התיקון הגדול - מבנה Flexbox לגובה מלא */}
                <div className="col-span-1 lg:col-span-8 bg-white lg:rounded-2xl shadow-xl border border-gray-200 flex flex-col h-full w-full overflow-hidden relative">
                    {/* Header */}
                    <div className="bg-white p-4 border-b flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">
                                    ראיון הקמה
                                </h2>
                                <p className="text-xs text-green-500 font-medium">
                                    מחוברת • נועה
                                </p>
                            </div>
                        </div>

                        {/* --- הכפתור החדש: דלג על שלב זה --- */}
                        <Button
                            variant="ghost"
                            onClick={handleSkip}
                            className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 text-xs md:text-sm gap-2"
                        >
                            דלג על שלב זה <SkipForward size={16} />
                        </Button>
                    </div>

                    {/* Messages Area - גולל רק כאן */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 custom-scrollbar space-y-6">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl text-sm md:text-base shadow-sm leading-relaxed ${m.role === "user"
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
                                <div className="bg-white border border-gray-200 px-4 py-2 rounded-2xl rounded-bl-none text-xs text-gray-400 shadow-sm flex items-center gap-2">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>{" "}
                                    מקלידה...
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} className="h-1" />
                    </div>

                    {/* Input Area - קבוע למטה */}
                    <div className="p-4 bg-white border-t shrink-0">
                        <div className="relative flex items-center">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSend()
                                }
                                placeholder="כתבי כאן..."
                                className="pr-4 pl-12 h-12 md:h-14 text-base rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-500 focus-visible:ring-offset-0"
                                autoFocus
                                disabled={isLoading}
                            />
                            <Button
                                onClick={handleSend}
                                size="icon"
                                className="absolute left-2 w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 shadow-md transition-all"
                                disabled={isLoading || !input.trim()}
                            >
                                <Send size={20} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
