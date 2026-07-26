"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UploadCloud, Users, Send } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

const PERSONAS = [
    {
        id: "golda",
        name: "גולדה",
        promptValue: "Assertive, Protective, Chief of Staff",
        avatar: "/avatars/golda.png",
        description: "רמטכ\"לית העסק. קשוחה, מגוננת, מנהלת יומן בצורה אבסולוטית."
    },
    {
        id: "david",
        name: "דוד",
        promptValue: "Tactical, Strategic, Operations Manager",
        avatar: "/avatars/david.png",
        description: "מנהל תפעול. טקטי, ממוקד מטרה, קר רוח ותכליתי."
    }
];

type Field = "businessName" | "ownerName" | "phone" | "niche" | "logo" | "persona" | "email" | "password" | "submitting" | "done";

type Message = {
    id: string;
    sender: "agent" | "user";
    text: React.ReactNode;
};

export default function CinematicOnboarding() {
    const router = useRouter();
    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    
    const [currentField, setCurrentField] = useState<Field>("businessName");
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    
    const [formData, setFormData] = useState({
        businessName: "",
        niche: "aesthetics",
        ownerName: "",
        phone: "",
        tone: "יוקרתי ומקצועי",
        email: "",
        password: "",
        logo_url: ""
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial greeting when started
    useEffect(() => {
        if (started && messages.length === 0) {
            setMessages([
                { id: "msg-1", sender: "agent", text: "היי! אני גולדה. אני אלווה אותך בתהליך ההקמה של העסק האוטונומי שלך. איך קוראים לעסק?" }
            ]);
        }
    }, [started, messages.length]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, currentField]);

    const addAgentMessage = (text: string) => {
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, sender: "agent", text }]);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("התמונה גדולה מדי (עד 2MB)");
            return;
        }

        setIsUploadingLogo(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            
            try {
                const res = await fetch("/api/onboarding/upload-logo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64 }),
                });

                const result = await res.json();
                if (result.success && result.url) {
                    setFormData(prev => ({ ...prev, logo_url: result.url }));
                    setMessages(prev => [...prev, { id: `msg-${Date.now()}`, sender: "user", text: "הלוגו הועלה בהצלחה" }]);
                    setIsUploadingLogo(false);
                    setTimeout(() => {
                        addAgentMessage("מצוין, הלוגו נשמר. עכשיו, מי תהיה מנהלת ה-AI שלך שמייצגת אותך מול לקוחות?");
                        setCurrentField("persona");
                    }, 600);
                }
            } catch (error) {
                console.error(error);
                toast.error("שגיאה בהעלאת הלוגו");
                setIsUploadingLogo(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFinalSubmit = async (finalData: typeof formData) => {
        setCurrentField("submitting");
        
        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: finalData.businessName,
                    ownerName: finalData.ownerName,
                    phone: finalData.phone,
                    email: finalData.email,
                    password: finalData.password,
                    niche: finalData.niche,
                    tone: finalData.tone,
                    logo_url: finalData.logo_url
                }),
            });

            const data = await res.json();
            const isEmailExistsError = data.error && data.error.includes("כבר רשום");

            if ((res.ok && data.success) || isEmailExistsError) {
                setCompleted(true);
                setCurrentField("done");
                addAgentMessage(isEmailExistsError ? "נראה שהאימייל כבר קיים במערכת, מתחבר..." : "העסק שלך הוקם בהצלחה! אני מעבירה אותך לדשבורד...");
                
                setTimeout(async () => {
                    const result = await signIn("credentials", {
                        redirect: false,
                        email: finalData.email,
                        password: finalData.password,
                    });

                    if (result?.error) {
                        toast.error("התחברות אוטומטית נכשלה, נא להתחבר ידנית.");
                        router.push("/login");
                    } else {
                        router.push(`/dashboard`);
                    }
                }, 1500);
            } else {
                toast.error(data.error || "משהו השתבש בהרשמה.");
                setCurrentField("password");
                addAgentMessage("הייתה בעיה ברישום. נסי להזין שוב את הסיסמה או לרענן את העמוד.");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאת תקשורת.");
            setCurrentField("password");
        }
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        const val = inputValue.trim();
        if (!val) return;

        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, sender: "user", text: val }]);
        setInputValue("");

        if (currentField === "businessName") {
            setFormData(prev => ({ ...prev, businessName: val }));
            setTimeout(() => {
                addAgentMessage("שם מהמם! ואיך קוראים לך (שם בעל/ת העסק)?");
                setCurrentField("ownerName");
            }, 600);
        } else if (currentField === "ownerName") {
            setFormData(prev => ({ ...prev, ownerName: val }));
            setTimeout(() => {
                addAgentMessage(`נעים מאוד ${val}. מהו מספר הטלפון של העסק?`);
                setCurrentField("phone");
            }, 600);
        } else if (currentField === "phone") {
            setFormData(prev => ({ ...prev, phone: val }));
            setTimeout(() => {
                addAgentMessage("רשמתי. באיזה תחום העסק פועל?");
                setCurrentField("niche");
            }, 600);
        } else if (currentField === "email") {
            if (!val.includes("@")) {
                setTimeout(() => addAgentMessage("זה לא נראה כמו אימייל תקין. נסי שוב?"), 400);
                return;
            }
            setFormData(prev => ({ ...prev, email: val }));
            setTimeout(() => {
                addAgentMessage("מעולה. לסיום, בחרי סיסמה כניסה למערכת (לפחות 6 תווים):");
                setCurrentField("password");
            }, 600);
        } else if (currentField === "password") {
            if (val.length < 6) {
                setTimeout(() => addAgentMessage("הסיסמה צריכה להיות לפחות 6 תווים."), 400);
                return;
            }
            const finalData = { ...formData, password: val };
            setFormData(finalData);
            setTimeout(() => {
                addAgentMessage("מצוין! אני מקימה את העסק שלך עכשיו. רק רגע...");
                handleFinalSubmit(finalData);
            }, 600);
        }
    };

    const handleOptionSelect = (option: { label: string, value: string }, type: "niche" | "persona") => {
        setMessages(prev => [...prev, { id: `msg-${Date.now()}`, sender: "user", text: option.label }]);
        
        if (type === "niche") {
            setFormData(prev => ({ ...prev, niche: option.value }));
            setTimeout(() => {
                addAgentMessage("הבנתי. יש לך לוגו לעסק שתרצי שיופיע באתר ובצ'אט?");
                setCurrentField("logo");
            }, 600);
        } else if (type === "persona") {
            setFormData(prev => ({ ...prev, tone: option.value }));
            setTimeout(() => {
                addAgentMessage("בחירה מצוינת. עכשיו בואי נגדיר פרטי גישה. מהו האימייל שלך?");
                setCurrentField("email");
            }, 600);
        }
    };

    const renderInputArea = () => {
        if (currentField === "submitting" || currentField === "done") {
            return (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center p-6 text-purple-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </motion.div>
            );
        }

        if (currentField === "niche") {
            const options = [
                { label: "קוסמטיקה ואסתטיקה", value: "aesthetics" },
                { label: "כושר וספורט", value: "fitness" },
                { label: "רפואה פרטית / מרפאות", value: "medical" },
                { label: "ספא ועיסויים", value: "spa" },
                { label: "אחר", value: "other" }
            ];
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 gap-2 p-4"
                >
                    {options.map(opt => (
                        <Button 
                            key={opt.value} 
                            variant="outline" 
                            onClick={() => handleOptionSelect(opt, "niche")}
                            className="bg-white/5 border-white/10 hover:bg-purple-900/40 text-white rounded-xl"
                        >
                            {opt.label}
                        </Button>
                    ))}
                </motion.div>
            );
        }

        if (currentField === "persona") {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3 p-4"
                >
                    {PERSONAS.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => handleOptionSelect({ label: p.name, value: p.promptValue }, "persona")}
                            className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-purple-900/40 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                            <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700 shrink-0">
                                <Users size={20} className="text-purple-400" />
                            </div>
                            <div>
                                <span className="text-white font-medium block">{p.name}</span>
                                <span className="text-xs text-slate-400">{p.description}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            );
        }

        if (currentField === "logo") {
            return (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="p-4 flex flex-col gap-3"
                >
                    <div 
                        className="border-2 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploadingLogo ? (
                            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                        ) : (
                            <>
                                <UploadCloud size={24} className="text-slate-400 mb-2" />
                                <span className="text-sm font-medium text-slate-300">לחצי להעלאת לוגו</span>
                            </>
                        )}
                    </div>
                    <Button 
                        variant="ghost" 
                        className="text-slate-500 hover:text-slate-300"
                        onClick={() => {
                            setMessages(prev => [...prev, { id: `msg-${Date.now()}`, sender: "user", text: "אין לי לוגו כרגע" }]);
                            setTimeout(() => {
                                addAgentMessage("אין בעיה, נמשיך הלאה. מי תהיה מנהלת ה-AI שלך שמייצגת אותך מול לקוחות?");
                                setCurrentField("persona");
                            }, 600);
                        }}
                    >
                        דלג לשלב הבא
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </motion.div>
            );
        }

        return (
            <motion.form 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSend} 
                className="p-4 flex gap-2 relative"
            >
                <Input 
                    autoFocus
                    type={currentField === "email" ? "email" : currentField === "password" ? "password" : "text"}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={
                        currentField === "businessName" ? "למשל: ביוטי קליניק..." : 
                        currentField === "ownerName" ? "השם המלא שלך..." : 
                        currentField === "phone" ? "05X-XXXXXXX..." : 
                        currentField === "email" ? "admin@mybusiness.com..." :
                        "הקלידי כאן..."
                    }
                    className="bg-white/5 border-white/10 text-white h-12 pr-4 rounded-xl flex-1 focus-visible:ring-purple-500" 
                />
                <Button 
                    type="submit" 
                    disabled={!inputValue.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-12 w-12 rounded-xl flex items-center justify-center shrink-0 p-0"
                >
                    <Send size={18} />
                </Button>
            </motion.form>
        );
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] flex flex-col items-center justify-center relative overflow-hidden" dir="rtl">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

            {/* The Animating Logo Container */}
            <motion.div
                className="absolute z-50 cursor-pointer"
                initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
                animate={{
                    opacity: 1,
                    scale: started && !completed ? 0.35 : completed ? 0.8 : 1,
                    x: started && !completed ? "38vw" : 0,
                    y: started && !completed ? "38vh" : 0,
                }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => { if (!started) setStarted(true); }}
            >
                {/* The Pulsing Logo Image */}
                <motion.div
                    animate={{ opacity: !started && !completed ? [1, 0.4, 1] : 1 }}
                    transition={{
                        opacity: !started && !completed 
                            ? { repeat: Infinity, duration: 2, ease: "easeInOut" } 
                            : { duration: 0.5 },
                    }}
                    className="relative w-64 h-32 md:w-80 md:h-40"
                >
                    <Image src="/logo.png" alt="FOZ AI Solutions" fill className="object-contain" priority />
                </motion.div>
            </motion.div>

            {/* The Start Screen Text */}
            <AnimatePresence>
                {!started && (
                    <motion.div
                        className="absolute z-40 top-1/4 w-full flex justify-center pointer-events-none"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            המציאות החדשה כבר כאן
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Container */}
            <AnimatePresence>
                {started && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="relative z-40 w-full max-w-lg px-4 flex flex-col h-[70vh] md:h-[600px] mt-10"
                    >
                        {/* Reassurance Notice */}
                        <div className="text-center mb-4 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-full py-2 px-4 shadow-sm inline-flex mx-auto">
                            💡 כל הנתונים שתזין כאן אינם סופיים וניתן לערוך אותם בקלות בדשבורד הניהול בכל עת
                        </div>

                        <div className="flex-1 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col relative">
                            {/* Chat Log */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div 
                                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                                                    msg.sender === "user" 
                                                    ? "bg-purple-600 text-white rounded-tl-sm" 
                                                    : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tr-sm"
                                                }`}
                                            >
                                                {msg.text}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="border-t border-white/10 bg-slate-900/50">
                                <AnimatePresence mode="wait">
                                    {renderInputArea()}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}