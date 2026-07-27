"use client";

import React from "react";
import dynamic from "next/dynamic";

const Player = dynamic(() => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player), {
    ssr: false,
    loading: () => <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse"></div>
});

interface DanielaHeaderProps {
    businessName: string;
}

export default function DanielaHeader({ businessName }: DanielaHeaderProps) {
    return (
        <div className="bg-zinc-900 dark:bg-zinc-950 text-white p-4 rounded-t-[2.5rem] flex items-center gap-4 border-b border-zinc-800/80">
            {/* The Animated Avatar (Left Side) */}
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0 -scale-x-100">
                <Player
                    autoplay
                    loop
                    src="/Daniela-small.json"
                    style={{ width: "100%", height: "100%" }}
                    renderer="svg"
                />
            </div>

            {/* The Text (Right Side) */}
            <div>
                <h3 className="font-bold text-white text-lg leading-tight">
                    דניאלה
                </h3>
                <p className="text-zinc-400 text-sm">
                    המזכירה של {businessName}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs text-zinc-300 font-medium">
                        זמינה כעת
                    </span>
                </div>
            </div>
        </div>
    );
}
