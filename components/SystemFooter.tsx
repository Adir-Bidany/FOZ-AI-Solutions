"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RESERVED_SLUGS } from "@/lib/constants/reserved-slugs";

export default function SystemFooter() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const firstSegment = pathname?.split("/")[1]?.toLowerCase();
    const isClientSite = !!(firstSegment && pathname !== "/" && !RESERVED_SLUGS.has(firstSegment));

    if (isClientSite) {
        return null;
    }

    return (
        <footer className="bg-background border-t border-border py-8 mt-auto text-foreground">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                {/* זכויות יוצרים */}
                <div className="text-center md:text-right">
                    <p>© {currentYear} FOZ AI Solutions</p>
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
