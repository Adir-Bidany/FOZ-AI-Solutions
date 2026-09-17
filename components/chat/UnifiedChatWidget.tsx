"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getInitialGreeting } from "@/actions/chat";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface Message {
    role: "user" | "assistant" | "model";
    content: string;
}

interface UnifiedChatWidgetProps {
    mode: "public" | "admin";
    variant: "embedded" | "floating";
    businessConfig?: any;
    initialMessages?: Message[];
    className?: string;
    agentPersona?: string;
    /** When set, the widget automatically sends this message once after mount (used by DanielaFAB). */
    autoSendMessage?: string;
}

type ConsentStatus = "bypassed" | "pending" | "approved" | "rejected";

export default function UnifiedChatWidget({
    mode,
    variant,
    businessConfig,
    initialMessages = [],
    className,
    agentPersona,
    autoSendMessage,
}: UnifiedChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [widgetType, setWidgetType] = useState<"date_picker" | "service_selector" | "confirmation" | null>(null);
    const [showCustomNote, setShowCustomNote] = useState(false);
    const [customNoteText, setCustomNoteText] = useState("");

    const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending");

    // Check hydration for consumer token / admin mode
    useEffect(() => {
        if (mode === "admin") {
            setConsentStatus("bypassed");
            return;
        }

        const consumerDataStr = typeof localStorage !== "undefined" ? localStorage.getItem("foz_consumer_data") : null;
        const hasConsumerToken = typeof document !== "undefined" && document.cookie.includes("consumer_token");
        const isRegistered = !!(consumerDataStr || hasConsumerToken);

        if (isRegistered) {
            setConsentStatus("bypassed");
        } else {
            setConsentStatus("pending");
        }
    }, [mode]);

    // Reset state if business context shifts
    useEffect(() => {
        setSessionId(null);
        setMessages(initialMessages);
    }, [businessConfig?._id]);

    // Listen for global security purge events (cross-route boundaries)
    useEffect(() => {
        const handlePurge = () => {
            console.log("[UnifiedChatWidget] Security purge received. Wiping state.");
            setSessionId(null);
            setMessages(initialMessages);
        };
        window.addEventListener("security-purge", handlePurge);
        return () => window.removeEventListener("security-purge", handlePurge);
    }, [initialMessages]);

    // --- PHASE 4: Load persistent chat history on mount for registered consumers ---
    useEffect(() => {
        // Only load history for the public daniela persona when the user is a registered consumer
        const hasConsumerToken = typeof document !== "undefined" && document.cookie.includes("consumer_token");
        if (mode !== "public" || agentPersona !== "daniela" || !hasConsumerToken) return;
        // Don't overwrite if we already have messages (e.g. passed via initialMessages)
        if (messages.length > 0) return;

        setIsLoadingHistory(true);
        fetch("/api/chat/history")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.messages && data.messages.length > 0) {
                    setMessages(data.messages as Message[]);
                    if (data.sessionId) {
                        setSessionId(data.sessionId);
                    }
                }
            })
            .catch((err) => {
                console.error("[UnifiedChatWidget] Failed to load chat history:", err);
            })
            .finally(() => {
                setIsLoadingHistory(false);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, agentPersona]);
    // --- END HISTORY LOADER ---

    // Fetch dynamic initial greeting if starting empty (only if consent is bypassed or approved)
    useEffect(() => {
        if (messages.length === 0 && !isLoadingHistory && agentPersona && (consentStatus === "approved" || consentStatus === "bypassed")) {
            getInitialGreeting(agentPersona).then((greeting) => {
                if (greeting) {
                    setMessages([{ role: "assistant", content: greeting }]);
                }
            });
        }
    }, [agentPersona, messages.length, isLoadingHistory, consentStatus]);

    // Auto-send a pre-filled message from the FAB / calendar slot click
    const autoSendFiredRef = useRef(false);
    useEffect(() => {
        if (
            autoSendMessage &&
            !autoSendFiredRef.current &&
            !isLoadingHistory &&
            (consentStatus === "bypassed" || consentStatus === "approved")
        ) {
            autoSendFiredRef.current = true;
            // Small delay to let greeting render first
            const timer = setTimeout(() => handleSend(autoSendMessage), 400);
            return () => clearTimeout(timer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSendMessage, isLoadingHistory, consentStatus]);

    const handleSend = async (content: string) => {
        // Add user message
        const userMsg: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const consumerDataStr = localStorage.getItem("foz_consumer_data");
            const consumerData = consumerDataStr ? JSON.parse(consumerDataStr) : null;
            const customerId = consumerData?.id || consumerData?._id || null;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content,
                    businessId: businessConfig?._id,
                    sessionId: sessionId,
                    agentPersona: agentPersona,
                    customerId: customerId,
                }),
            });

            const data = await response.json();

            if (data.response) {
                const aiMsg: Message = {
                    role: "assistant",
                    content: data.response,
                };
                setMessages((prev) => [...prev, aiMsg]);
                if (data.sessionId) {
                    setSessionId(data.sessionId);
                }
                
                if (data._system_action === "force_logout") {
                    window.dispatchEvent(new Event("consumer-force-logout"));
                } else if (data._system_action === "trigger_auth_drawer") {
                    // Defer by one tick to ensure BrandingAnchor's useEffect listener is always mounted
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("open-auth-drawer", { bubbles: true }));
                    }, 50);
                    setWidgetType(null);
                } else if (data._system_action === "show_date_picker") {
                    setWidgetType("date_picker");
                } else if (data._system_action === "show_services") {
                    setWidgetType("service_selector");
                } else if (data._system_action === "show_confirmation") {
                    setWidgetType("confirmation");
                } else {
                    setWidgetType(null);
                }
            } else {
                console.error("API Error:", data?.error || "Unknown response format");
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "מצטערים, חלה שגיאה זמנית בתקשורת. אנא נסה שוב בעוד רגע.",
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "מצטערים, חלה שגיאה זמנית בתקשורת. אנא נסה שוב בעוד רגע.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveConsent = async () => {
        setConsentStatus("approved");
        const approvalText = "אני מאשר/ת את תנאי השימוש והפרטיות";
        await handleSend(approvalText);
    };

    const handleRejectConsent = () => {
        setConsentStatus("rejected");
        setMessages((prev) => [
            ...prev,
            {
                role: "assistant",
                content: "מכיוון שלא אושרו תנאי השימוש, לא ניתן לקיים שיחה עם הסוכן. במידה ותתחרט/י, ניתן לרענן את העמוד ולנסות שוב.",
            },
        ]);
    };

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current && scrollRef.current.parentElement) {
            const container = scrollRef.current.parentElement;
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [messages, consentStatus]);

    return (
        <div className={cn("flex flex-col overflow-hidden", className)}>
            {/* Header (Optional based on variant) */}
            {variant === "floating" && (
                <div className="p-4 bg-zinc-900 dark:bg-zinc-950 text-white border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="font-bold text-sm">FOZ AI Solutions</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-xs text-zinc-300">מחובר 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent min-h-0">
                {/* History loading shimmer */}
                {isLoadingHistory && (
                    <div className="flex flex-col gap-3 animate-pulse">
                        <div className="flex justify-start"><div className="h-8 w-48 bg-muted rounded-2xl" /></div>
                        <div className="flex justify-end"><div className="h-8 w-32 bg-primary/20 rounded-2xl" /></div>
                        <div className="flex justify-start"><div className="h-8 w-56 bg-muted rounded-2xl" /></div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <ChatBubble
                        key={idx}
                        role={msg.role}
                        content={msg.content}
                        mode={mode}
                        avatarUrl={businessConfig?.logo}
                    />
                ))}
                {isLoading && (
                    <div className="flex justify-start w-full animate-pulse">
                        <div className="bg-muted rounded-2xl px-4 py-2 text-xs text-muted-foreground">
                            Thinking...
                        </div>
                    </div>
                )}
                
                {/* Guest Consent UI Banner */}
                {consentStatus === "pending" && (
                    <div className="bg-card/95 rounded-3xl shadow-lg border border-primary/20 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-start gap-3" dir="rtl">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="space-y-1.5 text-right">
                                <h4 className="text-sm font-bold text-foreground">אישור תנאי שימוש ובינה מלאכותית</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    כדי לבחון את פתרונות ה-AI שלנו ולהעניק לך את השירות הטוב ביותר, הצ'אט מופעל באמצעות אינטליגנציה מלאכותית ואיסוף נתונים בכפוף לתנאי השימוש ומדיניות הפרטיות שלנו.
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1" dir="rtl">
                            <button
                                type="button"
                                onClick={handleApproveConsent}
                                className="flex-1 py-2.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                אני מאשר/ת
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectConsent}
                                className="py-2.5 px-4 bg-muted text-muted-foreground font-semibold text-xs rounded-xl hover:bg-destructive/10 hover:text-destructive border border-border transition-all cursor-pointer"
                            >
                                לא מאשר/ת
                            </button>
                        </div>
                    </div>
                )}

                {/* Dynamic Widgets */}
                {widgetType === "date_picker" && (
                    <div className="bg-card/95 rounded-3xl shadow-lg border border-border/40 p-4 animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="text-sm font-bold text-center mb-2">בחירת תאריך</h4>
                        <div className="flex justify-center" dir="rtl">
                            <DayPicker 
                                mode="single" 
                                locale={he}
                                onSelect={(date) => {
                                    if (date) {
                                        setWidgetType(null);
                                        const dateStr = format(date, "yyyy-MM-dd");
                                        handleSend(`אשמח לבדוק תורים לתאריך ${dateStr}`);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {widgetType === "service_selector" && (
                    <div className="bg-card rounded-3xl shadow-lg border border-border/40 p-4 animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="text-sm font-bold mb-3">איזה טיפול תרצי לבדוק?</h4>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => { setWidgetType(null); handleSend("בוטוקס"); }} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">בוטוקס</button>
                            <button onClick={() => { setWidgetType(null); handleSend("טיפול חומצה היאלורונית"); }} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">חומצה היאלורונית</button>
                            <button onClick={() => { setWidgetType(null); handleSend("ייעוץ"); }} className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors">ייעוץ</button>
                            <button onClick={() => setShowCustomNote(true)} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-sm font-medium hover:bg-accent transition-colors">אחר</button>
                        </div>
                        {showCustomNote && (
                            <div className="mt-3 space-y-2">
                                <textarea 
                                    className="w-full text-sm p-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="אנא פרטי (עד 50 מילים)..."
                                    rows={2}
                                    value={customNoteText}
                                    onChange={(e) => setCustomNoteText(e.target.value)}
                                />
                                <button 
                                    onClick={() => {
                                        setWidgetType(null);
                                        setShowCustomNote(false);
                                        handleSend(`טיפול אחר. הערה: ${customNoteText}`);
                                        setCustomNoteText("");
                                    }}
                                    className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold"
                                >
                                    שלח והמשך
                                </button>
                            </div>
                        )}
                    </div>
                )}
                
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 pt-2">
                <ChatInput
                    onSend={handleSend}
                    isLoading={isLoading}
                    mode={mode}
                    placeholder={mode === "public" ? "שאל אותי כל דבר..." : "Type your message..."}
                    disabled={consentStatus === "pending" || consentStatus === "rejected"}
                />
            </div>
        </div>
    );
}
