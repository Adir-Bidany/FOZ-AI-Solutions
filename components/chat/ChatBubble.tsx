import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatBubbleProps {
    role: "user" | "assistant" | "model";
    content: string;
    mode: "public" | "admin";
    avatarUrl?: string;
}

export function ChatBubble({ role, content, mode, avatarUrl }: ChatBubbleProps) {
    const isUser = role === "user";
    const logoSrc = avatarUrl && avatarUrl !== "/favicon.ico" ? avatarUrl : "/logo.png";

    // Container alignment: User on right (justify-start in RTL), Agent on left (justify-end in RTL)
    const containerClass = cn(
        "flex w-full gap-2.5 mb-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-start" : "justify-end"
    );

    // Avatar styling with specific borders
    const avatarRingClass = isUser
        ? "border-2 border-blue-500 ring-2 ring-blue-500/30"
        : "border-2 border-yellow-400 ring-2 ring-yellow-400/30";

    // Bubble styles
    const bubbleClass = cn(
        "relative max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap font-medium",
        isUser
            ? "rounded-2xl rounded-tr-sm bg-primary text-primary-foreground"
            : "rounded-2xl rounded-tl-sm bg-card border border-border text-foreground dark:text-zinc-50"
    );

    // Safe JSON Parsing for AI messages containing structured JSON blobs
    const displayContent = React.useMemo(() => {
        if (!content) return "";
        try {
            const trimmed = content.trim();
            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                const parsed = JSON.parse(trimmed);
                if (parsed && (parsed.conversational_reply || parsed.reply || parsed.text)) {
                    return parsed.conversational_reply || parsed.reply || parsed.text;
                }
            }
        } catch (_) {
            // Not valid JSON
        }
        return content;
    }, [content]);

    return (
        <div className={containerClass} dir="rtl">
            {/* Avatar Logo on the RIGHT side of the bubble */}
            <Avatar suppressHydrationWarning className={cn("w-8 h-8 mt-0.5 shrink-0 bg-background overflow-hidden", avatarRingClass)}>
                <AvatarImage src={logoSrc} className="object-cover" suppressHydrationWarning />
                <AvatarFallback suppressHydrationWarning className={cn("font-bold text-xs", isUser ? "bg-blue-500/10 text-blue-500" : "bg-yellow-400/10 text-yellow-600")}>
                    {isUser ? "U" : "AI"}
                </AvatarFallback>
            </Avatar>

            {/* Message Content Bubble */}
            <div className={bubbleClass}>
                {displayContent}
            </div>
        </div>
    );
}
