"use client";

import { useEffect, useState } from "react";

interface ClientLogoProps {
    src: string | null;
    businessName: string;
}

export default function ClientLogo({ src, businessName }: ClientLogoProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        // Render minimal placeholder during SSR/Hydration to match layout
        return (
            <div className="w-full h-full bg-slate-50 rounded-lg animate-pulse" />
        );
    }

    if (src) {
        return (
            <img
                src={src}
                alt={`${businessName} Logo`}
                className="object-contain object-right w-full h-full"
            />
        );
    }

    // Fallback if no src (should generally be handled by parent, but safe to have)
    return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-2xl text-3xl font-bold shadow-sm">
            {businessName.charAt(0)}
        </div>
    );
}
