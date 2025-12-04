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
        "relative max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap",
        // Shape
        // Shape - Adjusted for RTL
        isUser ? "rounded-2xl rounded-tl-sm" : "rounded-2xl rounded-tr-sm",

        // Colors - PUBLIC MODE
        isPublic && isUser && "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-900/20",
        isPublic && !isUser && "bg-white/10 backdrop-blur-md border border-white/10 text-gray-100",

        // Colors - ADMIN MODE
        !isPublic && isUser && "bg-gray-900 text-white",
        !isPublic && !isUser && "bg-white border border-gray-200 text-gray-800"
    );

    return (
        <div className={containerClass}>
            {/* Avatar - Only show for bot in public, or both in admin if desired. 
                For now, showing for bot in both, and user in admin. */}
            {!isUser && (
                <Avatar className={cn("w-8 h-8 mt-1", isPublic ? "border border-white/20" : "border border-gray-100")}>
                    <AvatarImage src={avatarUrl || "/favicon.ico"} />
                    <AvatarFallback>D</AvatarFallback>
                </Avatar>
            )}

            {/* User Avatar in Admin Mode only */}
            {isUser && !isPublic && (
                <Avatar className="w-8 h-8 mt-1 border border-gray-100">
                    <AvatarFallback className="bg-gray-200 text-gray-600">Me</AvatarFallback>
                </Avatar>
            )}

            <div className={bubbleClass}>
                {content}
            </div>
        </div>
    );
}
