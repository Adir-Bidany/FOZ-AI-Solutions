"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UnifiedChatWidget from "@/components/chat/UnifiedChatWidget";

export default function HeroSection() {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <section
            className="relative w-full min-h-[90vh] flex items-center bg-[#0B0E14] overflow-hidden text-white"
            dir="rtl"
        >
            <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Right Side: Text */}
                <div className="flex flex-col gap-6 text-right order-2 lg:order-1">
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                        להפוך את העסק לאוטונומי <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                            על טייס אוטומטי מלא
                        </span>
                    </h1>

                    <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        צוות סוכני AI (גולדה, דניאלה, מיכל ורועי) שמנהלים לך את
                        השירות, היומן, השיווק והכספים - 24/7. ענה על מספר שאלות
                        וקבל אתר, דשבורד וסוכנים מוכנים ב-5 דקות.
                    </p>

                    <div className="flex flex-row gap-4 mt-4">
                        <Link href="/onboarding">
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white rounded-full px-8 py-6 text-lg gap-2 transition-all shadow-sm"
                            >
                                הקם עסק אוטונומי ב-5 דק' 🚀
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Left Side: 3D Chat */}
                <div className="relative w-full h-[600px] flex items-center justify-center order-1 lg:order-2 perspective-[1200px]">
                    <div
                        className={`
              relative w-full max-w-md h-[500px] flex flex-col
              transition-all duration-700 ease-out
              [transform-style:preserve-3d] group
              ${
                  !isFocused
                      ? "rotate-y-[-12deg] rotate-x-[8deg] scale-[1.03]"
                      : "rotate-y-[-4deg] rotate-x-[2deg] scale-100"
              }
            `}
                        onMouseEnter={() => setIsFocused(true)}
                        onMouseLeave={() => setIsFocused(false)}
                    >
                        {/* Reflection Layer */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-20 rounded-[2.5rem] pointer-events-none [transform:translateZ(1px)] z-50" />

                        {/* Unified Chat Widget */}
                        <UnifiedChatWidget
                            key="paz-demo"
                            mode="public"
                            variant="floating"
                            businessConfig={{
                                _id: "demo",
                                slug: "demo",
                                logo: "/favicon.ico",
                            }}
                            agentPersona="paz"
                            className="h-full w-full shadow-[0_40px_80px_-20px_rgba(59,130,246,0.4),_0_0_50px_-10px_rgba(139,92,246,0.3)]"
                        />

                        {/* Floating Elements */}
                        <div className="absolute top-0 right-[-40px] w-32 h-32 bg-purple-500/20 rounded-3xl blur-2xl animate-bounce delay-700 -z-10 [transform:translateZ(-60px)rotate(15deg)]" />
                        <div className="absolute bottom-10 left-[-50px] w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -z-10 [transform:translateZ(-40px)]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
