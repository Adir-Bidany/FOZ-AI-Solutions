"use client";

import React from "react";
import dynamic from "next/dynamic";

const Player = dynamic(() => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player), {
    ssr: false,
    loading: () => <div className="w-full h-full rounded-full bg-gray-100 animate-pulse"></div>
});

export default function DanielaAvatar() {
    return (
        <div className="w-96 h-96 flex items-center justify-center">
            <Player
                autoplay
                loop
                src="/daniela.json"
                style={{ width: "100%", height: "100%" }}
                renderer="svg"
            />
        </div>
    );
}
