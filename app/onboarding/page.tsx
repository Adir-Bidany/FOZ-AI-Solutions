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
import { Loader2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        phone: "",
        email: "",
        password: "",
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
            {/* רקע דקורטיבי - הוספתי הגבלות כדי למנוע גלילה אופקית */}
            <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-200/30 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-pink-200/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

            {/* הקונטיינר הראשי - שיפרתי את הרוחב למובייל */}
            <div className="relative z-10 w-full max-w-[95%] md:max-w-md my-6 md:my-10">
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl md:rounded-3xl p-5 md:p-8">
                    {/* לוגו וכותרת */}
                    <div className="text-center mb-6 md:mb-8">
                        <div className="relative w-32 h-16 md:w-48 md:h-20 mx-auto mb-2 md:mb-4">
                            <Image
                                src="/logo.png"
                                alt="FOZ AI Solutions"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                            ברוכה הבאה
                        </h1>
                        <p className="text-gray-500 mt-1 md:mt-2 text-xs md:text-sm">
                            יצירת חשבון והקמת הצוות הדיגיטלי שלך
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 md:space-y-5"
                    >
                        {/* --- פרטי כניסה --- */}
                        <div className="bg-white/60 p-3 md:p-4 rounded-xl border border-gray-100 space-y-3 md:space-y-4">
                            <h3 className="text-xs md:text-sm font-bold text-purple-900 mb-1">
                                פרטי התחברות
                            </h3>

                            <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-right flex items-center gap-2 text-xs md:text-sm">
                                    <Mail size={14} /> אימייל
                                </Label>
                                <Input
                                    required
                                    type="email"
                                    placeholder="your@email.com"
                                    className="bg-white border-gray-200 text-right h-10 md:h-11 text-sm"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-right flex items-center gap-2 text-xs md:text-sm">
                                    <Lock size={14} /> סיסמה
                                </Label>
                                <Input
                                    required
                                    type="password"
                                    placeholder="******"
                                    className="bg-white border-gray-200 text-right h-10 md:h-11 text-sm"
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
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-xs md:text-sm font-bold text-purple-900">
                                פרטי העסק
                            </h3>

                            <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-right block text-xs md:text-sm">
                                    שם העסק
                                </Label>
                                <Input
                                    required
                                    placeholder="למשל: שרה קוסמטיקס"
                                    className="bg-white/50 border-gray-200 text-right h-10 md:h-11 text-sm"
                                    value={formData.businessName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            businessName: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-right block text-xs md:text-sm">
                                    שם בעלת העסק
                                </Label>
                                <Input
                                    required
                                    placeholder="למשל: שרה כהן"
                                    className="bg-white/50 border-gray-200 text-right h-10 md:h-11 text-sm"
                                    value={formData.ownerName}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            ownerName: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-1.5 md:space-y-2">
                                <Label className="text-right block text-xs md:text-sm">
                                    טלפון (לוואטסאפ)
                                </Label>
                                <Input
                                    required
                                    type="tel"
                                    placeholder="050-0000000"
                                    className="bg-white/50 border-gray-200 text-right h-10 md:h-11 text-sm"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-right block text-xs md:text-sm">
                                        תחום העיסוק
                                    </Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFormData({
                                                ...formData,
                                                niche: val,
                                            })
                                        }
                                        defaultValue={formData.niche}
                                    >
                                        <SelectTrigger className="bg-white/50 border-gray-200 text-right h-10 md:h-11 text-sm">
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

                                <div className="space-y-1.5 md:space-y-2">
                                    <Label className="text-right block text-xs md:text-sm">
                                        סגנון הדיבור
                                    </Label>
                                    <Select
                                        onValueChange={(val) =>
                                            setFormData({
                                                ...formData,
                                                tone: val,
                                            })
                                        }
                                        defaultValue={formData.tone}
                                    >
                                        <SelectTrigger className="bg-white/50 border-gray-200 text-right h-10 md:h-11 text-sm">
                                            <SelectValue placeholder="בחרי סגנון" />
                                        </SelectTrigger>
                                        <SelectContent dir="rtl">
                                            <SelectItem value="יוקרתי ומקצועי">
                                                💎 יוקרתי ומקצועי
                                            </SelectItem>
                                            <SelectItem value="חם ומזמין">
                                                🌸 חם ומזמין
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
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 md:h-12 text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 mt-4 md:mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    יוצר משתמש...
                                </>
                            ) : (
                                "הקם את העסק שלי 🚀"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
