import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
    role: "user" | "assistant" | "model"; // 'model' is sometimes used for AI
    content: string;
    mode: "public" | "admin";
    avatarUrl?: string;
}

export function ChatBubble({ role, content, mode, avatarUrl }: ChatBubbleProps) {
    const isUser = role === "user";
    const isPublic = mode === "public";

    // Base styles
    // Base styles - Adjusted for RTL
    // In RTL: justify-start = Right, justify-end = Left
    const containerClass = cn(
        "flex w-full gap-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-start" : "justify-end flex-row-reverse"
    );

    // Bubble styles based on Mode + Role
    const bubbleClass = cn(
        "relative max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap font-medium",
        // Shape - Adjusted for RTL
        isUser ? "rounded-2xl rounded-tl-sm" : "rounded-2xl rounded-tr-sm",

        // User bubble: Stark Black in Light mode, Silver in Dark mode
        isUser && "bg-primary text-primary-foreground",

        // Agent (Paz) bubble: Clean card background with stark text-foreground high contrast
        !isUser && "bg-card border border-border text-foreground dark:text-zinc-50"
    );

    return (
        <div className={containerClass}>
            {/* Avatar for bot */}
            {!isUser && (
                <Avatar className="w-8 h-8 mt-1 border border-border shrink-0">
                    <AvatarImage src={avatarUrl || "/favicon.ico"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">P</AvatarFallback>
                </Avatar>
            )}

            {/* User Avatar in Admin Mode */}
            {isUser && !isPublic && (
                <Avatar className="w-8 h-8 mt-1 border border-border shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">U</AvatarFallback>
                </Avatar>
            )}

            <div className={bubbleClass}>
                {content}
            </div>
        </div>
    );
}
