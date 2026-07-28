"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SystemFooter() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    // אם אנחנו בתוך ה-Setup (צ'אט הקמה) או בתוך דשבורד, אולי נרצה להסתיר את הפוטר
    // כדי לתת תחושה של אפליקציה ("App-like feel").
    // לשיקולך: כרגע השארתי אותו גלוי, אבל אם תרצה להסתיר, תוסיף את התנאי הבא:
    /*
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/onboarding")) {
      return null;
  }
  */
    
    if (pathname?.startsWith("/c/")) {
        return null;
    }

    return (
        <footer className="bg-background border-t border-border py-8 mt-auto text-foreground">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                {/* זכויות יוצרים */}
                <div className="text-center md:text-right">
                    <p>© {currentYear} FOZ AI Solutions. כל הזכויות שמורות.</p>
                </div>

                {/* קישורים משפטיים */}
                <div className="flex items-center gap-6">
                    <Link
                        href="/legal/terms"
                        className="hover:text-foreground transition-colors"
                    >
                        תנאי שימוש
                    </Link>
                    <Link
                        href="/legal/privacy"
                        className="hover:text-foreground transition-colors"
                    >
                        מדיניות פרטיות
                    </Link>
                </div>
            </div>
        </footer>
    );
}
