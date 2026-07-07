"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                toast.error("פרטי ההתחברות שגויים");
                setIsLoading(false);
                return;
            }

            toast.success("התחברת בהצלחה!");
            router.refresh();

            // בדיקת סשן כדי להפנות נכון
            const sessionRes = await fetch("/api/auth/session");
            const session = await sessionRes.json();

            if (session?.user?.email) {
                router.push(`/dashboard`);
            } else {
                router.push("/");
            }
        } catch (error) {
            console.error(error);
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
            {/* רקע דקורטיבי - הותאם למניעת גלילה */}
            <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-200/30 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] bg-pink-200/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-[95%] md:max-w-sm">
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl md:rounded-3xl p-6 md:p-8">
                    <div className="text-center mb-6 md:mb-8">
                        <div className="relative w-32 h-14 md:w-40 md:h-16 mx-auto mb-3 md:mb-4">
                            <Image
                                src="/logo.png"
                                alt="FOZ"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="text-lg md:text-xl font-bold text-gray-900">
                            כניסה למערכת
                        </h1>
                        <p className="text-gray-500 text-xs md:text-sm mt-1">
                            ברוכה השבה! הכניסי פרטים כדי להמשיך.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5 md:space-y-2">
                            <Label className="text-right block text-xs md:text-sm">
                                אימייל
                            </Label>
                            <Input
                                type="email"
                                required
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
                            <div className="flex justify-between items-center">
                                <Label className="text-xs md:text-sm">
                                    סיסמה
                                </Label>
                                <Link
                                    href="#"
                                    className="text-[10px] md:text-xs text-purple-600 hover:underline"
                                >
                                    שכחת סיסמה?
                                </Link>
                            </div>
                            <Input
                                type="password"
                                required
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

                        <Button
                            type="submit"
                            className="w-full bg-gray-900 hover:bg-gray-800 rounded-xl h-10 md:h-11 text-sm md:text-base mt-2"
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

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">
                                או
                            </span>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-xl h-10 md:h-11 text-sm md:text-base gap-2"
                        onClick={() => signIn("google")}
                        disabled={isLoading}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        התחברות עם Google
                    </Button>

                    <div className="mt-6 text-center text-xs md:text-sm text-gray-500">
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
