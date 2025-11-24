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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        phone: "",
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

            if (data.success) {
                toast.success("מזל טוב! הקליניקה הוקמה בהצלחה.", {
                    description: `המזהה שלך הוא: ${data.slug}`,
                    duration: 5000,
                });
                // כאן בעתיד נעביר לדשבורד
            } else {
                toast.error("משהו השתבש.", {
                    description: "אנא נסי שנית או צרי קשר עם התמיכה.",
                });
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
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 relative overflow-hidden">
            {/* רקע אווירה */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8">
                    <div className="text-center mb-8">
                        {/* הלוגו החדש במקום האייקון */}
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
                            בואי נקים את הצוות הדיגיטלי שלך בכמה שניות.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-gray-700 text-right block">
                                שם העסק / הקליניקה
                            </Label>
                            <Input
                                required
                                placeholder="למשל: שרה קוסמטיקס"
                                className="bg-white/50 border-gray-200 focus:bg-white transition-all text-right"
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
                            <Label className="text-gray-700 text-right block">
                                שם בעלת העסק
                            </Label>
                            <Input
                                required
                                placeholder="למשל: שרה כהן"
                                className="bg-white/50 border-gray-200 focus:bg-white transition-all text-right"
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
                            <Label className="text-gray-700 text-right block">
                                טלפון (לוואטסאפ)
                            </Label>
                            <Input
                                required
                                type="tel"
                                placeholder="050-0000000"
                                className="bg-white/50 border-gray-200 focus:bg-white transition-all text-right"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2" dir="rtl">
                            <Label className="text-gray-700 text-right block">
                                סגנון הדיבור של הבוט
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
                                        💎 יוקרתי ומקצועי (ד"ר)
                                    </SelectItem>
                                    <SelectItem value="חם ומזמין">
                                        🌸 חם, מזמין ואישי
                                    </SelectItem>
                                    <SelectItem value="קליל וצעיר">
                                        ✨ קליל, צעיר ואינסטגרמי
                                    </SelectItem>
                                    <SelectItem value="תכליתי וקצר">
                                        ⚡ תכליתי וקצר
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 text-base shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    מקים את המערכת...
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
