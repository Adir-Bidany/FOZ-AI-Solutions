"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function SystemHeader() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    // הסתרת ה-Header בתוך הדשבורד
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    const isClientSite = pathname?.startsWith("/c/");

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    return (
        // הוספתי overflow-hidden כדי למנוע גלישה במקרים קיצוניים
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-20 md:h-28 shadow-sm transition-all overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                {/* --- צד ימין: הלוגו --- */}
                <Link
                    href="/"
                    className="hover:opacity-90 transition-opacity flex items-center h-full"
                >
                    {/* התיקון הקריטי: */}
                    {/* במובייל (ברירת מחדל) הרוחב הוא w-32 (כ-128px). זה משאיר מקום לכפתורים */}
                    {/* בדסקטופ (md) הרוחב גדל ל-w-[340px] */}
                    <div className="relative w-32 md:w-[340px] h-full py-4 md:py-2">
                        <Image
                            src="/logo.png"
                            alt="FOZ AI Solutions"
                            fill
                            className="object-contain object-right"
                            priority
                        />
                    </div>
                </Link>

                {/* --- צד שמאל: כפתורים --- */}
                <div className="flex items-center gap-2 md:gap-3 shrink-0">
                    <Link
                        href="/admin"
                        title="כניסת מנהל מערכת"
                        className="hidden md:block"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <ShieldCheck size={20} />
                        </Button>
                    </Link>

                    <div className="h-6 md:h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

                    {status === "loading" && (
                        <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-md" />
                    )}

                    {status === "authenticated" && (
                        <div className="flex items-center gap-2 md:gap-4 animate-in fade-in">
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-sm md:text-base font-bold text-gray-800 leading-none">
                                    {session?.user?.name || "מנהלת"}
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
                            >
                                <LogOut size={18} className="ml-0 md:ml-2" />
                                <span className="hidden md:inline">התנתק</span>
                            </Button>
                        </div>
                    )}

                    {status === "unauthenticated" && (
                        <div className="flex items-center gap-2 md:gap-4">
                            {" "}
                            {/* הגדלתי רווח טיפה */}
                            {/* --- קישור חדש למחירים --- */}
                            {!isClientSite && (
                                <Link
                                    href="/pricing"
                                    className="hidden md:block"
                                >
                                    <Button
                                        variant="ghost"
                                        className="text-sm font-medium text-gray-600 hover:text-purple-600"
                                    >
                                        מחירים
                                    </Button>
                                </Link>
                            )}
                            {!isClientSite && (
                                <>
                                    <Link href="/login">
                                        <Button
                                            variant="ghost"
                                            className="text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-2 md:px-4"
                                        >
                                            התחברות
                                        </Button>
                                    </Link>

                                    <Link href="/onboarding">
                                        <Button className="text-sm font-bold h-9 md:h-10 px-4 md:px-6 bg-gray-900 text-white shadow-md border border-transparent hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 hover:shadow-none transition-all rounded-full">
                                            הרשמה
                                        </Button>
                                    </Link>
                                </>
                            )}
                            {isClientSite && (
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-gray-900 text-xs"
                                    >
                                        כניסת מנהלת
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
