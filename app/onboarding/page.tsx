"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud, ChevronRight, Lock, Mail, Star, Users, Briefcase, Zap } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { GOLDA_PRESET, DAVID_PRESET } from "@/lib/constants/personas";

const PERSONAS = [
    {
        id: "golda",
        name: "גולדה",
        promptValue: GOLDA_PRESET.tone,
        avatar: "/avatars/golda.png",
        description: "רמטכ\"לית העסק. קשוחה, מגוננת, מנהלת יומן בצורה אבסולוטית."
    },
    {
        id: "david",
        name: "דוד",
        promptValue: DAVID_PRESET.tone,
        avatar: "/avatars/david.png",
        description: "מנהל תפעול. טקטי, ממוקד מטרה, קר רוח ותכליתי."
    }
];

export default function CinematicOnboarding() {
    const router = useRouter();
    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    
    // Multi-step modal state
    const [currentStep, setCurrentStep] = useState(0);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
            setFormData(prev => ({ ...prev, logo_url: base64 }));
            
            try {
                // Pre-upload logo to get URL so it's ready for final submit
                const res = await fetch("/api/setup/upload-logo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64 }),
                });

                const result = await res.json();
                if (result.success && result.url) {
                    setFormData(prev => ({ ...prev, logo_url: result.url }));
                    toast.success("הלוגו הועלה בהצלחה!");
                }
            } catch (error) {
                console.error(error);
                toast.error("שגיאה בהעלאת הלוגו");
            } finally {
                setIsUploadingLogo(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFinalSubmit = async () => {
        if (!formData.email || !formData.password || !formData.businessName) {
            toast.error("נא למלא את כל שדות החובה.");
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Create Business and User
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessName: formData.businessName,
                    ownerName: formData.ownerName,
                    phone: formData.phone,
                    email: formData.email,
                    password: formData.password,
                    niche: formData.niche,
                    tone: formData.tone,
                    logo_url: formData.logo_url
                }),
            });

            const data = await res.json();

            const isEmailExistsError = data.error && data.error.includes("כבר רשום");

            if ((res.ok && data.success) || isEmailExistsError) {
                setCompleted(true);
                toast.success(isEmailExistsError ? "מתחבר לחשבון הקיים..." : "העסק הוקם בהצלחה!", { duration: 3000 });
                
                // Wait for the exit animation
                setTimeout(async () => {
                    // 2. Silent Auto-Login
                    const result = await signIn("credentials", {
                        redirect: false,
                        email: formData.email,
                        password: formData.password,
                    });

                    if (result?.error) {
                        toast.error("התחברות אוטומטית נכשלה, נא לבדוק את הסיסמה או להתחבר ידנית.");
                        setIsSubmitting(false);
                        setCompleted(false);
                        router.push("/login");
                    } else {
                        router.push(`/dashboard`);
                    }
                }, 1500);
            } else {
                toast.error(data.error || "משהו השתבש בהרשמה.");
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאת תקשורת.");
            setIsSubmitting(false);
        }
    };

    const nextStep = () => setCurrentStep(p => Math.min(3, p + 1));
    const prevStep = () => setCurrentStep(p => Math.max(0, p - 1));

    // Steps configuration
    const steps = [
        { id: 0, title: "פרטי העסק", icon: Briefcase },
        { id: 1, title: "מיתוג", icon: Star },
        { id: 2, title: "אישיות ה-AI", icon: Zap },
        { id: 3, title: "אבטחה", icon: Lock },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden" dir="rtl">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px] pointer-events-none" />

            {/* The Animating Logo */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: 1,
                    scale: started && !completed ? 0.3 : completed ? 0.8 : 1,
                    y: started && !completed ? "40vh" : completed ? 0 : 0,
                    x: started && !completed ? "-40vw" : completed ? 0 : 0,
                }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute z-50 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => { if (!started) setStarted(true); }}
            >
                {!started && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            המציאות החדשה כבר כאן
                        </h1>
                    </motion.div>
                )}
                <div className="relative w-64 h-32 md:w-80 md:h-40">
                    <Image
                        src="/logo.png"
                        alt="FOZ AI Solutions"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </motion.div>

            {/* The Multi-Step Modal */}
            <AnimatePresence>
                {started && !completed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
                        className="relative z-40 w-full max-w-2xl px-4"
                    >
                        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 shadow-2xl rounded-3xl overflow-hidden">
                            
                            {/* Tabs Indicator */}
                            <div className="flex justify-between items-center px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 relative">
                                {steps.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === idx;
                                    const isPast = currentStep > idx;
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-2 relative z-10 w-full">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isActive ? "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" : 
                                                isPast ? "bg-purple-900/50 text-purple-400 border border-purple-700/50" : 
                                                "bg-slate-800 text-slate-500 border border-slate-700"
                                            }`}>
                                                <Icon size={18} />
                                            </div>
                                            <span className={`text-xs font-medium transition-colors ${isActive ? "text-white" : isPast ? "text-purple-400" : "text-slate-500"}`}>
                                                {step.title}
                                            </span>
                                        </div>
                                    )
                                })}
                                {/* Progress Line Background */}
                                <div className="absolute top-9 left-12 right-12 h-[2px] bg-slate-800 -z-0" />
                                {/* Active Progress Line */}
                                <div 
                                    className="absolute top-9 right-12 h-[2px] bg-purple-600 transition-all duration-500 -z-0"
                                    style={{ width: `calc(${(currentStep / 3) * 100}% - 48px)` }} 
                                />
                            </div>

                            <div className="p-8 min-h-[400px] flex flex-col justify-between">
                                {/* Step 0: Business Info */}
                                {currentStep === 0 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">שם העסק</Label>
                                            <Input 
                                                value={formData.businessName}
                                                onChange={e => setFormData(p => ({ ...p, businessName: e.target.value }))}
                                                className="bg-slate-800/50 border-slate-700 text-white h-12 text-lg" 
                                                placeholder="למשל: ביוטי קליניק"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">שם בעל/ת העסק</Label>
                                                <Input 
                                                    value={formData.ownerName}
                                                    onChange={e => setFormData(p => ({ ...p, ownerName: e.target.value }))}
                                                    className="bg-slate-800/50 border-slate-700 text-white h-12" 
                                                    placeholder="שם מלא"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">טלפון</Label>
                                                <Input 
                                                    value={formData.phone}
                                                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                                    className="bg-slate-800/50 border-slate-700 text-white h-12" 
                                                    placeholder="05X-XXXXXXX"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">תחום פעילות (נישה)</Label>
                                            <Select value={formData.niche} onValueChange={v => setFormData(p => ({ ...p, niche: v }))}>
                                                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-12">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                    <SelectItem value="aesthetics">קוסמטיקה ואסתטיקה</SelectItem>
                                                    <SelectItem value="fitness">כושר וספורט</SelectItem>
                                                    <SelectItem value="medical">רפואה פרטית / מרפאות</SelectItem>
                                                    <SelectItem value="spa">ספא ועיסויים</SelectItem>
                                                    <SelectItem value="other">אחר</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 1: Branding (Logo) */}
                                {currentStep === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-medium text-white">הלוגו של העסק</h3>
                                            <p className="text-slate-400 mt-1">העלי את לוגו העסק כדי שהבינה המלאכותית תטמיע אותו בצ'אט בוט ובעמוד הנחיתה.</p>
                                        </div>
                                        <div 
                                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors h-48
                                                ${formData.logo_url ? 'border-purple-500/50 bg-purple-900/20' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
                                            `}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {isUploadingLogo ? (
                                                <div className="flex flex-col items-center gap-3 text-purple-400">
                                                    <Loader2 className="w-8 h-8 animate-spin" />
                                                    <span>מעלה לוגו...</span>
                                                </div>
                                            ) : formData.logo_url ? (
                                                <div className="relative w-full h-full flex items-center justify-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={formData.logo_url} alt="Logo" className="max-h-full max-w-full object-contain drop-shadow-lg" />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-3 text-slate-400">
                                                    <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
                                                        <UploadCloud size={28} />
                                                    </div>
                                                    <span className="font-medium">לחצי להעלאת תמונה</span>
                                                    <span className="text-xs text-slate-500">עד 2MB בפורמט PNG/JPG</span>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </motion.div>
                                )}

                                {/* Step 2: AI Persona */}
                                {currentStep === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-medium text-white">מי תהיה מנהלת המערכת שלך?</h3>
                                            <p className="text-slate-400 mt-1">בחרי את אישיות ה-AI שתייצג את העסק שלך מול הלקוחות.</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {PERSONAS.map(p => (
                                                <div 
                                                    key={p.id}
                                                    onClick={() => setFormData(prev => ({ ...prev, tone: p.promptValue }))}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                                        formData.tone === p.promptValue 
                                                            ? "bg-purple-900/30 border-purple-500" 
                                                            : "bg-slate-800/50 border-slate-700 hover:border-slate-500"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center overflow-hidden border border-slate-700">
                                                            <Users size={20} className="text-purple-400" />
                                                        </div>
                                                        <span className="text-white font-medium">{p.name}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400">{p.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Auth Details */}
                                {currentStep === 3 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-medium text-white">הגדרת אמצעי גישה</h3>
                                            <p className="text-slate-400 mt-1">אחרי הרישום תועברי ישירות למערכת הניהול.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">אימייל להתחברות</Label>
                                                <div className="relative">
                                                    <Mail className="absolute right-3 top-3.5 text-slate-500" size={18} />
                                                    <Input 
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                                        className="bg-slate-800/50 border-slate-700 text-white h-12 pr-10" 
                                                        placeholder="admin@mybusiness.com"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-slate-300">סיסמה</Label>
                                                <div className="relative">
                                                    <Lock className="absolute right-3 top-3.5 text-slate-500" size={18} />
                                                    <Input 
                                                        type="password"
                                                        value={formData.password}
                                                        onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                                                        className="bg-slate-800/50 border-slate-700 text-white h-12 pr-10" 
                                                        placeholder="********"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Navigation Actions */}
                                <div className="mt-8 pt-6 border-t border-slate-700/50 flex justify-between items-center">
                                    <Button 
                                        variant="ghost" 
                                        onClick={prevStep}
                                        disabled={currentStep === 0 || isSubmitting}
                                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                                    >
                                        חזור
                                    </Button>
                                    
                                    {currentStep < 3 ? (
                                        <Button 
                                            onClick={nextStep}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-8 rounded-full"
                                            disabled={currentStep === 0 && !formData.businessName}
                                        >
                                            המשך <ChevronRight className="ml-2 w-4 h-4 mr-1" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={handleFinalSubmit}
                                            disabled={isSubmitting || !formData.email || !formData.password}
                                            className="bg-green-600 hover:bg-green-700 text-white px-8 rounded-full shadow-[0_0_20px_rgba(22,163,74,0.3)]"
                                        >
                                            {isSubmitting ? (
                                                <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> מפעיל מערכת...</>
                                            ) : (
                                                "הפעל את המערכת"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}