"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UnifiedChatWidget from "@/components/chat/UnifiedChatWidget";
import { motion } from "framer-motion";

type HoverState = "none" | "hover1" | "hover2" | "hover3";

function ScatteredLine({
    text,
    className,
    delay = 0,
    hoverState = "none",
}: {
    text: string;
    className?: string;
    delay?: number;
    hoverState?: HoverState;
}) {
    const [isIdle, setIsIdle] = useState(false);

    const words = useMemo(() => {
        let globalCharIndex = 0;
        return text.split(" ").map((word) =>
            word.split("").map((char) => {
                const idleDelay = globalCharIndex * 0.12;
                const charIndex = globalCharIndex;
                globalCharIndex++;
                return {
                    char,
                    x: (Math.random() - 0.5) * 850,
                    y: (Math.random() - 0.5) * 850,
                    rotate: (Math.random() - 0.5) * 270,
                    idleDelay,
                    charIndex,
                };
            })
        );
    }, [text]);

    const activeAnimation = hoverState !== "none" ? hoverState : isIdle ? "idle" : "visible";

    return (
        <motion.span
            className={`inline-flex flex-wrap gap-x-[0.28em] ${className || ""}`}
            initial="hidden"
            animate={activeAnimation}
            onAnimationComplete={() => {
                if (!isIdle && hoverState === "none") {
                    setIsIdle(true);
                }
            }}
            variants={{
                hidden: { opacity: 1 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.04,
                        delayChildren: delay,
                    },
                },
                idle: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.04,
                    },
                },
                hover1: { opacity: 1 },
                hover2: { opacity: 1 },
                hover3: { opacity: 1 },
            }}
        >
            {words.map((letters, wordIdx) => (
                <motion.span
                    key={wordIdx}
                    className="inline-block whitespace-nowrap"
                    variants={{
                        hidden: { opacity: 1 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                            },
                        },
                        idle: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.04,
                            },
                        },
                        hover1: { opacity: 1 },
                        hover2: { opacity: 1 },
                        hover3: { opacity: 1 },
                    }}
                >
                    {letters.map((item, charIdx) => (
                        <motion.span
                            key={charIdx}
                            className="inline-block [transform-style:preserve-3d]"
                            variants={{
                                hidden: {
                                    opacity: 0,
                                    x: item.x,
                                    y: item.y,
                                    rotate: item.rotate,
                                    rotateX: 0,
                                    scale: 0.4,
                                    filter: "blur(0px)",
                                },
                                visible: {
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    rotate: 0,
                                    rotateX: 0,
                                    scale: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        duration: 2.1,
                                        ease: [0.16, 1, 0.3, 1], // Cinematic entrance
                                    },
                                },
                                idle: {
                                    opacity: 1,
                                    x: 0,
                                    y: [0, -3.5, 0],
                                    rotate: 0,
                                    rotateX: 0,
                                    scale: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        duration: 4.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: item.idleDelay,
                                    },
                                },
                                hover1: {
                                    /* Hover 1: The Wave — sequential smooth lift & return */
                                    opacity: 1,
                                    x: 0,
                                    y: [0, -12, 0],
                                    rotate: 0,
                                    rotateX: 0,
                                    scale: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        duration: 1.8,
                                        ease: "easeInOut",
                                        delay: item.charIndex * 0.035,
                                    },
                                },
                                hover2: {
                                    /* Hover 2: Cinematic Spread — X offset & subtle blur peak */
                                    opacity: 1,
                                    x: [0, item.charIndex % 2 === 0 ? 10 : -10, 0],
                                    y: 0,
                                    rotate: 0,
                                    rotateX: 0,
                                    scale: 1,
                                    filter: ["blur(0px)", "blur(2.5px)", "blur(0px)"],
                                    transition: {
                                        duration: 1.8,
                                        ease: "easeInOut",
                                        delay: item.charIndex * 0.035,
                                    },
                                },
                                hover3: {
                                    /* Hover 3: 3D Flip — sequential rotateX cascade */
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    rotate: 0,
                                    rotateX: [0, 360],
                                    scale: 1,
                                    filter: "blur(0px)",
                                    transition: {
                                        duration: 1.8,
                                        ease: "easeInOut",
                                        delay: item.charIndex * 0.035,
                                    },
                                },
                            }}
                        >
                            {item.char}
                        </motion.span>
                    ))}
                </motion.span>
            ))}
        </motion.span>
    );
}

export default function HeroSection() {
    const [isFocused, setIsFocused] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Hover Interaction System State
    const [hoverState, setHoverState] = useState<HoverState>("none");
    const [hoverCount, setHoverCount] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleHeadlineHover = () => {
        // BATCH 30 Isolation: Disable hover completely to isolate Entrance -> Idle transition
        return;
    };

    return (
        <section
            className="relative w-full min-h-[90svh] flex items-center bg-background overflow-hidden text-foreground"
            dir="rtl"
        >
            <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Right Side: Text */}
                <div className="flex flex-col gap-6 text-right order-2 lg:order-1">
                    <h1
                        className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight tracking-tight select-none"
                    >
                        {mounted ? (
                            <>
                                <ScatteredLine
                                    text="להפוך את העסק לאוטונומי"
                                    className="block"
                                    delay={0.1}
                                    hoverState={hoverState}
                                />
                                <ScatteredLine
                                    text="על טייס אוטומטי מלא"
                                    className="block mt-2 text-foreground/70 dark:text-foreground/60"
                                    delay={0.45}
                                    hoverState={hoverState}
                                />
                            </>
                        ) : (
                            <>
                                <span className="block">להפוך את העסק לאוטונומי</span>
                                <span className="block mt-2 text-foreground/70 dark:text-foreground/60">
                                    על טייס אוטומטי מלא
                                </span>
                            </>
                        )}
                    </h1>

                    <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                        צוות סוכני ה-AI המתקדם של FOZ (גולדה ודניאלה) שמנהלים עבורך את
                        השירות, היומן, השיווק והניתוח הפיננסי — 24/7. ענו על מספר שאלות קצרות
                        וקבלו אתר אינטרנט, דשבורד ניהול וסוכנים חכמים מוכנים ב-5 דקות!
                    </p>

                    <div className="flex flex-row flex-wrap gap-4 mt-4">
                        <Link href="/onboarding">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-lg gap-2 transition-all shadow-md"
                            >
                                הקם עסק אוטונומי ב-5 דק' 🚀
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Left Side: 3D Chat */}
                <div className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center order-1 lg:order-2 perspective-[1200px]">
                    <div
                        className={`
              relative w-full max-w-md h-[300px] md:h-[450px] flex flex-col
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
                            className="h-full w-full rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(255,255,255,0.35)] border border-transparent dark:border-white/10 backdrop-blur-xl bg-card/90"
                        />

                        {/* Floating Elements */}
                        <div className="absolute top-0 right-[-40px] w-32 h-32 bg-slate-400/10 rounded-3xl blur-2xl animate-bounce delay-700 -z-10 [transform:translateZ(-60px)rotate(15deg)]" />
                        <div className="absolute bottom-10 left-[-50px] w-40 h-40 bg-slate-300/10 rounded-full blur-3xl -z-10 [transform:translateZ(-40px)]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
