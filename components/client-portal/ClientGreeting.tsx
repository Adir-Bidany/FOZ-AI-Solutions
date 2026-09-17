"use client";

import { useMemo } from "react";

interface ClientGreetingProps {
    customerName: string;
}

function getJerusalemHour(): number {
    // Use Intl to get the current hour in Asia/Jerusalem timezone
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jerusalem",
        hour: "numeric",
        hour12: false,
    });
    return parseInt(formatter.format(now), 10);
}

function getGreeting(hour: number): { text: string; icon: string } {
    if (hour >= 5 && hour < 12) return { text: "בוקר טוב",     icon: "☀️" };
    if (hour >= 12 && hour < 17) return { text: "צהריים טובים", icon: "🌤️" };
    if (hour >= 17 && hour < 21) return { text: "ערב טוב",      icon: "🌙" };
    return { text: "לילה טוב", icon: "🌟" };
}

export default function ClientGreeting({ customerName }: ClientGreetingProps) {
    const { text, icon } = useMemo(() => getGreeting(getJerusalemHour()), []);

    const firstName = customerName?.split(" ")[0] || customerName;

    return (
        <div className="flex flex-col gap-1" dir="rtl">
            <p className="text-sm font-medium text-muted-foreground">ברוך שובך 👋</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {text}, {firstName}! {icon}
            </h1>
        </div>
    );
}
