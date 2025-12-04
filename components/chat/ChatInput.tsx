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
}

export function ChatInput({ onSend, isLoading, placeholder, mode }: ChatInputProps) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const isPublic = mode === "public";

    const handleSend = () => {
        if (!value.trim() || isLoading) return;
        onSend(value);
        setValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={cn(
            "relative flex items-center gap-2 p-1",
            isPublic ? "bg-white/5 border border-white/10 rounded-full backdrop-blur-md" : "bg-white"
        )}>
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Type a message..."}
                disabled={isLoading}
                className={cn(
                    "flex-1 border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3 h-auto",
                    isPublic ? "bg-transparent text-white placeholder:text-gray-400" : "bg-transparent text-gray-900 placeholder:text-gray-400"
                )}
            />
            <Button
                size="icon"
                onClick={handleSend}
                disabled={isLoading || !value.trim()}
                className={cn(
                    "rounded-full shrink-0 transition-all",
                    isPublic
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                )}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
        </div>
    );
}
