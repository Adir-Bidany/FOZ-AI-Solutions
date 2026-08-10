import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
    placeholder?: string;
    mode: "public" | "admin";
    disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, placeholder, mode, disabled }: ChatInputProps) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const isPublic = mode === "public";

    const handleSend = () => {
        if (!value.trim() || isLoading || disabled) return;
        onSend(value);
        setValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const effectivePlaceholder = disabled
        ? "יש לאשר את תנאי השימוש כדי להשתמש בצ'אט..."
        : (placeholder || "שאל אותי כל דבר...");

    return (
        <div className="relative flex items-center gap-2 p-1.5 bg-card/95 border border-border/80 rounded-full shadow-sm backdrop-blur-md">
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={effectivePlaceholder}
                disabled={isLoading || disabled}
                className="flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto bg-transparent text-foreground placeholder:text-muted-foreground font-medium text-sm"
            />
            <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || disabled || !value.trim()}
                className="rounded-full shrink-0 transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
        </div>
    );
}
