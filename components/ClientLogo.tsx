"use client";

import React from "react";

interface ClientLogoProps {
    src: string | null;
    businessName: string;
}

export default function ClientLogo({ src, businessName }: ClientLogoProps) {
    if (src) {
        return (
            <img
                src={src}
                alt={`${businessName} Logo`}
                className="object-contain object-right w-full h-full"
            />
        );
    }

    const firstChar = businessName ? businessName.trim().charAt(0) : "E";

    return (
        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 text-purple-600 dark:text-purple-300 rounded-2xl text-3xl font-bold shadow-sm">
            {firstChar}
        </div>
    );
}
