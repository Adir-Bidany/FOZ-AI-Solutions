"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const prevPathRef = useRef(pathname);

    useEffect(() => {
        // Detect boundary crossing from /dashboard back to public routes
        if (prevPathRef.current?.startsWith("/dashboard") && !pathname.startsWith("/dashboard")) {
            console.log("[Security] Boundary crossing detected. Purging state.");
            // Purge any lingering sessionStorage
            sessionStorage.clear();
            
            // Dispatch a global event that any deeply nested components (like UnifiedChatWidget) 
            // can optionally listen to if they need to manually reset un-keyed states.
            window.dispatchEvent(new Event("security-purge"));
        }
        prevPathRef.current = pathname;
    }, [pathname]);

    return <SessionProvider>{children}</SessionProvider>;
}
