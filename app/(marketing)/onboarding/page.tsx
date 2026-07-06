"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Send,
    Sparkles,
    UploadCloud,
    Info,
    Check,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// --- Types ---
interface FormData {
    owner_name: string;
    business_name: string;
    business_type: string;
    address: string;
    ai_persona: string;
    manager_name: string;
    logo: string | null;
    business_knowledge: string;
}

const INITIAL_FORM_DATA: FormData = {
    owner_name: "",
    business_name: "",
    business_type: "",
    address: "",
    ai_persona: "female",
    manager_name: "Golda",
    logo: null,
    business_knowledge: ""
};

// --- Instructions Component ---
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
                    הצ'אט שואל שאלות. עני עליהן בצורה ברורה.
                </span>
            </li>
            <li className="flex gap-3 items-start">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    2
                </span>
                <span className="text-gray-700">
                    תוכלי תמיד לשנות את <strong>אופי המנהלת</strong> ואת <strong>הלוגו</strong> מהתפריט הצדדי.
                </span>
            </li>
        </ul>
    </div>
);

export default function OnboardingPage() {
    const [messages, setMessages] = useState<any[]>([
        {
            role: "assistant",
            content: "היי! אני כאן כדי לעזור בהקמת המערכת. המטרה שלי היא לעזור בניהול וצמיחת העסק. נתחיל? קודם כל, איך קוראים לך?"
        }
    ]);
    const [input, setInput] = useState("");
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    
    // Auth fields for the final step
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto Scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading, isFinished]);

    // File Upload Handler (Local State)
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("הקובץ גדול מדי (עד 2MB)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setFormData(prev => ({ ...prev, logo: base64 }));
            toast.success("הלוגו נשמר בהצלחה!");
            
            // If the chat is specifically waiting for the logo (step 4), auto-advance
            if (step === 4) {
                handleNextStep("לוגו הועלה!");
            }
        };
        reader.readAsDataURL(file);
    };

    // Manager Persona Handler (Local State)
    const handleGenderChange = (newGender: "female" | "male") => {
        const newName = newGender === "female" ? "Golda" : "David";
        setFormData(prev => ({ ...prev, ai_persona: newGender, manager_name: newName }));
        toast.success(`המנהל שונה ל-${newName}`);
    };

    // Chat Logic
    const handleNextStep = (value: string) => {
        const newFormData = { ...formData };

        switch (step) {
            case 0: newFormData.owner_name = value; break;
            case 1: newFormData.business_name = value; break;
            case 2: newFormData.business_type = value; break;
            case 3: newFormData.address = value; break;
            case 4: /* Logo handles itself or skips */ break;
            case 5: newFormData.business_knowledge = value; break;
        }

        setFormData(newFormData);
        
        // Add User Message
        setMessages(prev => [...prev, { role: "user", content: value }]);
        
        setIsLoading(true);
        setInput("");

        setTimeout(() => {
            setIsLoading(false);
            processNextStep(step + 1, newFormData);
        }, 800);
    };

    const processNextStep = (nextStep: number, currentData: FormData) => {
        setStep(nextStep);
        let nextQuestion = "";

        switch (nextStep) {
            case 1:
                nextQuestion = `נעים להכיר ${currentData.owner_name}! איך נקרא לעסק?`;
                break;
            case 2:
                nextQuestion = "כדי שנדע למכור נכון, מה התחום העיקרי של העסק? (למשל: הסרת שיער בלייזר, קוסמטיקה, אימון כושר...)";
                break;
            case 3:
                nextQuestion = "מהי כתובת העסק? (אם אין כתובת פיזית, אפשר לרשום אזור שירות).";
                break;
            case 4:
                nextQuestion = "נהדר. נשמח לקבל לוגו או תמונה מייצגת של העסק (אפשר להעלות מצד ימין). אם אין לך כרגע, אפשר לכתוב 'אין לי'.";
                break;
            case 5:
                nextQuestion = "מעולה. האם יש מידע נוסף או שאלות נפוצות שלקוחות שואלים בדרך כלל שחשוב לדעת? (למשל: חניה, הסדרי נגישות, שעות פעילות)";
                break;
            case 6:
                setMessages(prev => [...prev, { role: "assistant", content: "מושלם! הגענו לשלב האחרון. כדי שניצור את החשבון והמערכת שלך, אנא הזיני את המייל והסיסמה המבוקשים למטה." }]);
                setIsFinished(true);
                return;
        }

        if (nextQuestion) {
            setMessages(prev => [...prev, { role: "assistant", content: nextQuestion }]);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        handleNextStep(input);
    };

    // Final Setup API Call
    const handleFinalConfirm = async () => {
        if (!email || !password) {
            toast.error("אנא הזיני אימייל וסיסמה כדי להמשיך.");
            return;
        }

        if (password.length < 6) {
            toast.error("הסיסמה צריכה להיות באורך 6 תווים לפחות.");
            return;
        }

        try {
            setIsLoading(true);
            toast.loading("מקים את העסק ושומר את הנתונים...");

            const payload = {
                email,
                password,
                ...formData,
                collectedData: messages // Pass history so we can store it or parse it later
            };

            const res = await fetch("/api/setup/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                toast.dismiss();
                toast.success("בשעה טובה! העסק הוקם. מתחבר...");
                
                // Auto login
                await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                setTimeout(() => {
                    router.push(`/dashboard/${data.slug || ''}`);
                }, 1500);
            } else {
                toast.dismiss();
                toast.error(data.error || "שגיאה ביצירת העסק");
                setIsLoading(false);
            }
        } catch (e) {
            toast.dismiss();
            toast.error("תקלה בתקשורת");
            setIsLoading(false);
        }
    };

    // Components for the Right Pane
    const LogoUploader = () => (
        <div className="flex flex-col gap-4">
            <div
                className="border-2 border-dashed border-purple-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors relative overflow-hidden group min-h-[150px]"
                onClick={() => fileInputRef.current?.click()}
            >
                {formData.logo ? (
                    <div className="relative w-full h-32">
                        <Image
                            src={formData.logo}
                            alt="Logo Preview"
                            fill
                            className="object-contain"
                        />
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs font-medium rounded-xl">
                            לחצי להחלפה
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud size={24} />
                        </div>
                        <p className="text-sm text-gray-500 font-medium text-center group-hover:text-purple-700">
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
        </div>
    );

    const ManagerPersonaSelector = () => (
        <div className="space-y-4">
            <div className="flex gap-2">
                <button
                    onClick={() => handleGenderChange("female")}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.ai_persona === "female"
                            ? "border-purple-600 bg-purple-50 text-purple-700 shadow-sm"
                            : "border-gray-100 hover:border-gray-200 text-gray-500"
                        }`}
                >
                    <div className="text-2xl">👩‍💼</div>
                    <span className="font-bold text-sm">גולדה</span>
                    <span className="text-[10px] opacity-80 text-center">קשוחה ומגוננת</span>
                </button>
                <button
                    onClick={() => handleGenderChange("male")}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.ai_persona === "male"
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-gray-100 hover:border-gray-200 text-gray-500"
                        }`}
                >
                    <div className="text-2xl">👨‍💼</div>
                    <span className="font-bold text-sm">דוד</span>
                    <span className="text-[10px] opacity-80 text-center">טקטי ותכליתי</span>
                </button>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">שם המנהל/ת:</label>
                <div className="flex gap-2">
                    <Input
                        value={formData.manager_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, manager_name: e.target.value }))}
                        className="h-9 text-sm focus-visible:ring-purple-500"
                    />
                </div>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-gray-50 flex flex-col lg:p-8 overflow-hidden"
            dir="rtl"
        >
            {/* Mobile Header Button */}
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
                            <DialogTitle>הגדרות חשבון</DialogTitle>
                        </DialogHeader>
                        <LogoUploader />
                        <ManagerPersonaSelector />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full lg:h-[85vh] self-center">
                
                {/* Right Side: Logo, Persona, Instructions */}
                <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 h-full overflow-hidden">
                    <Card className="p-6 bg-white shadow-sm border-purple-100 shrink-0 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <UploadCloud
                                size={18}
                                className="text-purple-600"
                            />{" "}
                            הלוגו שלך
                        </h3>
                        <LogoUploader />
                    </Card>

                    <Card className="p-6 bg-white shadow-sm border-purple-100 shrink-0 hover:shadow-md transition-shadow">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <Sparkles size={18} className="text-purple-600" />
                            המנהל הדיגיטלי שלך
                        </h3>
                        <ManagerPersonaSelector />
                    </Card>

                    <Card className="p-6 bg-white shadow-lg flex-1 border border-gray-100 overflow-y-auto">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                            <Info size={20} className="text-purple-600" />{" "}
                            הוראות
                        </h3>
                        <InstructionsContent />
                    </Card>
                </div>

                {/* Left Side: Chat */}
                <div className="col-span-1 lg:col-span-8 bg-white lg:rounded-2xl shadow-xl border border-gray-200 flex flex-col h-full w-full overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="bg-white p-4 border-b flex justify-between items-center shrink-0 shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shadow-inner">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800">
                                    ראיון הקמה
                                </h2>
                                <p className="text-xs text-green-500 font-medium">
                                    ההתכתבות נשמרת אוטומטית במערכת
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 custom-scrollbar space-y-6">
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
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

                    {/* Input Area (Chat or Final Step Form) */}
                    {isFinished ? (
                        <div className="p-6 bg-purple-50 border-t border-purple-100 shrink-0 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="max-w-md mx-auto space-y-4">
                                <h3 className="font-bold text-purple-900 text-center mb-4">יצירת חשבון מנהל</h3>
                                <Input
                                    type="email"
                                    placeholder="אימייל"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white h-12 rounded-xl border-purple-200 focus-visible:ring-purple-500 text-right"
                                />
                                <Input
                                    type="password"
                                    placeholder="סיסמה (לפחות 6 תווים)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-white h-12 rounded-xl border-purple-200 focus-visible:ring-purple-500 text-right"
                                />
                                <Button
                                    onClick={handleFinalConfirm}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg h-12 rounded-xl font-bold mt-2 text-lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "סיימתי, צור לי עסק! 🚀"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white border-t shrink-0">
                            {step === 5 ? (
                                <div className="flex gap-2 relative items-end">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="כתבי כאן (Shift+Enter לירידת שורה)..."
                                        className="pr-4 pl-14 pt-3 h-24 text-base rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-500 resize-none"
                                        autoFocus
                                    />
                                    <Button
                                        onClick={handleSend}
                                        size="icon"
                                        className="absolute left-2 bottom-2 w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 shadow-md transition-all"
                                        disabled={isLoading || !input.trim()}
                                    >
                                        <Send size={20} />
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative flex items-center">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                        placeholder="כתבי כאן..."
                                        className="pr-4 pl-14 h-12 md:h-14 text-base rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-purple-500 focus-visible:ring-offset-0"
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
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}