"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("אנא הזן דוא\"ל וסיסמה");
            return;
        }

        setIsLoading(true);
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: email.trim(),
                password: password,
            });

            if (res?.error) {
                toast.error("פרטי התחברות שגויים. אנא נסה שוב.");
            } else {
                toast.success("התחברת בהצלחה! מעביר לדשבורד...");
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Login Error:", err);
            toast.error("תקלה בתהליך ההתחברות.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans" dir="rtl">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

            {/* Floating Theme Toggle */}
            <div className="fixed top-6 left-6 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md relative z-10 space-y-6">
                {/* Logo Branding */}
                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                    <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity inline-block">
                        <div className="relative w-48 h-20 sm:w-56 sm:h-24">
                            <Image src="/logo.png" alt="FOZ AI Solutions" fill className="object-contain" priority />
                        </div>
                    </Link>
                </div>

                {/* Login Card */}
                <Card className="bg-card/90 backdrop-blur-xl border border-border shadow-xl dark:shadow-[0_0_100px_rgba(255,255,255,0.35)] rounded-3xl overflow-hidden transition-all duration-500">
                    <CardHeader className="text-center sm:text-right pb-4 pt-6 px-6 sm:px-8 border-b border-border/40 bg-muted/20">
                        <CardTitle className="text-2xl font-bold text-foreground text-center">
                            התחברות למערכת הדשבורד
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-8 space-y-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-muted-foreground" /> דואר אלקטרוני
                                </Label>
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@mybusiness.com"
                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-2xl px-4 text-sm focus-visible:ring-primary font-sans"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-muted-foreground" /> סיסמה
                                </Label>
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-2xl px-4 text-sm focus-visible:ring-primary font-sans"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 mt-2 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-sm gap-2 text-sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                      כניסה <ArrowRight className="w-4 h-4 rotate-180" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="pt-4 border-t border-border/60 text-center">
                            <p className="text-xs text-muted-foreground">
                                עדיין אין לך חשבון?{" "}
                                <Link
                                    href="/onboarding"
                                    className="font-bold text-foreground hover:underline transition-all"
                                >
                                    הצטרפו עכשיו למהפכת ה- AI
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
