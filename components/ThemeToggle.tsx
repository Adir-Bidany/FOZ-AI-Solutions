"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="icon"
                className={`w-10 h-10 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm text-muted-foreground shadow-sm ${className || ""}`}
                disabled
            >
                <Sun size={18} className="opacity-0" />
            </Button>
        );
    }

    const isDark = theme === "dark";

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`w-10 h-10 rounded-full border border-border/60 bg-card/80 backdrop-blur-sm transition-all hover:bg-accent hover:border-border text-muted-foreground hover:text-foreground shadow-sm ${className || ""}`}
            title={isDark ? "החלף למצב יום" : "החלף למצב לילה"}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun size={18} className="text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
            ) : (
                <Moon size={18} className="text-foreground transition-transform duration-300 rotate-0 scale-100" />
            )}
        </Button>
    );
}

export default ThemeToggle;
