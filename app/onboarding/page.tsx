"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { Loader2, Mail, Lock } from "lucide-react"; // הוספתי אייקונים
import { toast } from "sonner";

export default function Onboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // עדכון ה-State עם שדות מייל וסיסמה
    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        phone: "",
        email: "", // <--- חדש
        password: "", // <--- חדש
        niche: "aesthetics",
        tone: "יוקרתי ומקצועי",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("העסק הוקם בהצלחה!", {
                    description: "מיד תעברי לראיון אישי עם מנהלת המערכת.",
                    duration: 3000,
                });

                setTimeout(() => {
                    router.push(`/setup/${data.slug}`);
                }, 1500);
            } else {
                // טיפול בשגיאה (למשל אם המייל תפוס)
                toast.error(data.error || "משהו השתבש בהרשמה.");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאת תקשורת.", {
                description: "אנא בדקי את החיבור לאינטרנט.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 relative overflow-hidden"
            dir="rtl"
        >
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full max-w-md my-10">
                {" "}
                {/* הוספתי my-10 למרווח */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="relative w-48 h-20 mx-auto mb-4">
                            <Image
                                src="/logo.png"
                                alt="FOZ AI Solutions"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            ברוכה הבאה
                        </h1>
                        <p className="text-gray-500 mt-2 text-sm">
                            יצירת חשבון והקמת הצוות הדיגיטלי שלך
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* --- פרטי כניסה (חדש) --- */}
                        <div className="bg-white/60 p-4 rounded-xl border border-gray-100 space-y-4">
                            <h3 className="text-sm font-bold text-purple-900 mb-2">
                                פרטי התחברות
                            </h3>

                            <div className="space-y-2">
                                <Label className="text-right block flex items-center gap-2">
                                    <Mail size={14} /> אימייל
                                </Label>
                                <Input
                                    required
                                    type="email"
                                    placeholder="your@email.com"
                                    className="bg-white border-gray-200 text-right"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-right block flex items-center gap-2">
                                    <Lock size={14} /> סיסמה
                                </Label>
                                <Input
                                    required
                                    type="password"
                                    placeholder="******"
                                    className="bg-white border-gray-200 text-right"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        {/* --- פרטי העסק --- */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-purple-900">
                                פרטי העסק
                            </h3>

                            <div className="space-y-2">
                                <Label className="text-right block">
                                    שם העסק
                                </Label>
                                <Input
                                    required
                                    placeholder="למשל: שרה קוסמטיקס"
                                    className="bg-white/50 border-gray-200 text-right"
                                    value={formData.businessName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            businessName: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-right block">
                                    שם בעלת העסק
                                </Label>
                                <Input
                                    required
                                    placeholder="למשל: שרה כהן"
                                    className="bg-white/50 border-gray-200 text-right"
                                    value={formData.ownerName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            ownerName: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-right block">
                                    טלפון (לוואטסאפ)
                                </Label>
                                <Input
                                    required
                                    type="tel"
                                    placeholder="050-0000000"
                                    className="bg-white/50 border-gray-200 text-right"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-right block">
                                    תחום העיסוק
                                </Label>
                                <Select
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, niche: val })
                                    }
                                    defaultValue={formData.niche}
                                >
                                    <SelectTrigger className="bg-white/50 border-gray-200 text-right">
                                        <SelectValue placeholder="בחרי תחום" />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                        <SelectItem value="aesthetics">
                                            💉 אסתטיקה ויופי
                                        </SelectItem>
                                        <SelectItem value="therapy">
                                            🧠 טיפול וייעוץ
                                        </SelectItem>
                                        <SelectItem value="hair">
                                            💈 עיצוב שיער
                                        </SelectItem>
                                        <SelectItem value="alternative">
                                            🌿 רפואה משלימה
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-right block">
                                    סגנון הדיבור
                                </Label>
                                <Select
                                    onValueChange={(val) =>
                                        setFormData({ ...formData, tone: val })
                                    }
                                    defaultValue={formData.tone}
                                >
                                    <SelectTrigger className="bg-white/50 border-gray-200 text-right">
                                        <SelectValue placeholder="בחרי סגנון" />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                        <SelectItem value="יוקרתי ומקצועי">
                                            💎 יוקרתי ומקצועי
                                        </SelectItem>
                                        <SelectItem value="חם ומזמין">
                                            🌸 חם, מזמין ואישי
                                        </SelectItem>
                                        <SelectItem value="קליל וצעיר">
                                            ✨ קליל וצעיר
                                        </SelectItem>
                                        <SelectItem value="תכליתי וקצר">
                                            ⚡ תכליתי וקצר
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    יוצר משתמש...
                                </>
                            ) : (
                                "הקמי את העסק שלי 🚀"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
