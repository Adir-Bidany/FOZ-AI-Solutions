"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("התחברת בהצלחה!", { duration: 2000 });
                // העברה לדשבורד האישי שלה
                router.push(`/dashboard/${data.slug}`);
            } else {
                toast.error(data.error || "פרטי ההתחברות שגויים");
            }
        } catch (error) {
            toast.error("שגיאת תקשורת");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 relative overflow-hidden"
            dir="rtl"
        >
            {/* רקע אווירה */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[120px]" />

            <div className="relative z-10 w-full max-w-sm">
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="relative w-40 h-16 mx-auto mb-4">
                            <Image
                                src="/logo.png"
                                alt="FOZ"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            כניסה למערכת
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            ברוכה השבה! הכניסי פרטים כדי להמשיך.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-right block">אימייל</Label>
                            <Input
                                type="email"
                                required
                                className="bg-white border-gray-200 text-right"
                                placeholder="name@example.com"
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
                            <div className="flex justify-between items-center">
                                <Label>סיסמה</Label>
                                <Link
                                    href="#"
                                    className="text-xs text-purple-600 hover:underline"
                                >
                                    שכחת סיסמה?
                                </Link>
                            </div>
                            <Input
                                type="password"
                                required
                                className="bg-white border-gray-200 text-right"
                                placeholder="******"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={16} className="ml-2" /> התחברות
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        עוד אין לך חשבון?{" "}
                        <Link
                            href="/onboarding"
                            className="text-purple-600 font-medium hover:underline"
                        >
                            הירשמי עכשיו
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
