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

    const isClientSite = pathname?.startsWith("/c/");

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/");
    };

    return (
        // שינוי קריטי: הגדלתי את הגובה ל-h-28 (כ-112px) כדי שהלוגו יוכל לגדול
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 h-28 shadow-sm transition-all">
            <div className="container mx-auto px-4 md:px-6 h-full flex items-center justify-between">
                {/* --- צד ימין: הלוגו --- */}
                <Link
                    href="/"
                    className="hover:opacity-90 transition-opacity flex items-center h-full"
                >
                    {/* נותן לו רוחב נדיב וגובה מלא כדי שיתפרס */}
                    <div className="relative w-[400px] h-full py-2">
                        <Image
                            src="/logo.png"
                            alt="FOZ AI Solutions"
                            fill
                            className="object-contain object-right" // נצמד לימין ומנצל את כל הגובה החדש
                            priority
                        />
                    </div>
                </Link>

                {/* --- צד שמאל: כפתורים --- */}
                <div className="flex items-center gap-3">
                    {/* כפתור אדמין */}
                    <Link href="/admin" title="כניסת מנהל מערכת">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <ShieldCheck size={20} />
                        </Button>
                    </Link>

                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    {status === "loading" && (
                        <div className="h-10 w-24 bg-gray-100 animate-pulse rounded-md" />
                    )}

                    {status === "authenticated" && (
                        <div className="flex items-center gap-4 animate-in fade-in">
                            <div className="hidden md:flex flex-col items-end mr-1">
                                <span className="text-base font-bold text-gray-800 leading-none">
                                    {session?.user?.name || "מנהלת"}
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
                            >
                                <LogOut size={20} className="ml-2" />
                                התנתק
                            </Button>
                        </div>
                    )}

                    {status === "unauthenticated" && (
                        <div className="flex items-center gap-3">
                            {!isClientSite && (
                                <>
                                    <Link href="/login">
                                        <Button
                                            variant="ghost"
                                            className="text-lg font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                                        >
                                            התחברות
                                        </Button>
                                    </Link>

                                    <Link href="/onboarding">
                                        <Button className="text-lg font-bold h-12 px-8 bg-gray-900 text-white shadow-md border border-transparent hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 hover:shadow-none transition-all rounded-full">
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
                                        className="text-gray-400 hover:text-gray-900 text-sm"
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
