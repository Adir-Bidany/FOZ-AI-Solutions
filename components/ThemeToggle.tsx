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
                variant="ghost"
                size="icon"
                className={`w-9 h-9 rounded-xl text-muted-foreground ${className || ""}`}
                disabled
            >
                <Sun size={18} className="opacity-0" />
            </Button>
        );
    }

    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`w-9 h-9 rounded-xl transition-colors hover:bg-accent text-muted-foreground hover:text-foreground ${className || ""}`}
            title={isDark ? "החלף למצב יום" : "החלף למצב לילה"}
            aria-label="Toggle theme"
        >
            {isDark ? (
                <Sun size={18} className="text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
            ) : (
                <Moon size={18} className="text-slate-700 dark:text-slate-200 transition-transform duration-300 rotate-0 scale-100" />
            )}
        </Button>
    );
}

export default ThemeToggle;
