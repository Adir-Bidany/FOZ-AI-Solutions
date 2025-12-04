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
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 rounded-t-[2.5rem] flex items-center gap-4">
            {/* The Animated Avatar (Left Side) */}
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 shrink-0">
                <Player
                    autoplay
                    loop
                    src="/daniela.json"
                    style={{ width: "100%", height: "100%" }}
                    renderer="svg"
                />
            </div>

            {/* The Text (Right Side) */}
            <div>
                <h3 className="font-bold text-white text-lg leading-tight">
                    דניאלה
                </h3>
                <p className="text-indigo-100 text-sm opacity-90">
                    המזכירה של {businessName}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-xs text-green-300 font-medium">
                        זמינה כעת
                    </span>
                </div>
            </div>
        </div>
    );
}
