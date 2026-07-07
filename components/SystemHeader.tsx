"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function SystemHeader() {
    const pathname = usePathname();

    // הסתרת ה-Header בתוך הדשבורד
    if (pathname?.startsWith("/dashboard")) {
        return null;
    }

    const isClientSite = pathname?.startsWith("/c/");

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
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {!isClientSite && (
                        <>
                            <Link href="/login">
                                <Button
                                    variant="ghost"
                                    className="text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 px-3 md:px-5"
                                >
                                    כניסה לאדמין
                                </Button>
                            </Link>

                            <Link href="/onboarding">
                                <Button className="text-sm font-bold h-9 md:h-10 px-5 md:px-7 bg-gray-900 text-white shadow-md hover:bg-gray-800 transition-all rounded-full">
                                    הרשמה
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
