"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Facebook, Instagram, ShieldCheck, Unlink, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function IntegrationsHealth({ metaConfig, setMetaConfig }: { metaConfig?: any, setMetaConfig?: any }) {
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("meta_connected") === "true") {
            toast.success("חיבור אל Meta (פייסבוק & אינסטגרם) הושלם בהצלחה!");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (params.get("error")) {
            const errCode = params.get("error");
            const errMap: Record<string, string> = {
                MISSING_META_KEYS: "חסרים נתוני התחברות (App ID) בסביבת העבודה.",
                META_AUTH_CANCELED: "התחברות אל Meta בוטלה.",
                NO_FACEBOOK_PAGE_FOUND: "לא נמצאו דפים מחוברים לחשבון הפייסבוק שלך.",
                TOKEN_EXCHANGE_FAILED: "שגיאה בהחלפת אסימון הגישה מול Meta.",
            };
            toast.error((errCode && errMap[errCode]) || "שגיאה בחיבור אל Meta.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleConnectMeta = () => {
        window.location.href = "/api/integrations/meta/connect";
    };

    const handleDisconnectMeta = async () => {
        if (!confirm("האם אתה בטוח שברצונך לנתק את החיבור אל Meta (פייסבוק ואינסטגרם)?")) return;

        setIsDisconnecting(true);
        try {
            const res = await fetch("/api/integrations/meta/disconnect", { method: "DELETE" });
            if (res.ok) {
                if (setMetaConfig) setMetaConfig(null);
                toast.success("חיבור אל Meta נותק בהצלחה.");
            } else {
                toast.error("שגיאה בניתוק החיבור.");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בניתוק מול השרת.");
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <section id="v2-integrations-health" aria-label="מצב חיבורים לרשתות חברתיות">
            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-none">
                        מצב חיבורים
                    </h2>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${metaConfig?.isConnected ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`} />
                    <span className="text-xs font-bold text-foreground">
                        {metaConfig?.isConnected ? "1/1 מחוברים" : "0/1 מחוברים"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Meta Integration Card */}
                <div className={`group bg-card border rounded-2xl p-4 shadow-sm transition-all duration-300 ${metaConfig?.isConnected ? "border-emerald-500/30" : "border-red-500/20"}`}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm text-white">
                                <Facebook className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Meta (Facebook & Instagram)</h3>
                                <div className={`text-[11px] font-bold mt-0.5 ${metaConfig?.isConnected ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                                    {metaConfig?.isConnected ? "מחובר" : "לא מחובר"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {metaConfig?.isConnected ? (
                        <div className="space-y-3 pt-3 border-t border-border/40">
                            <div className="flex items-center gap-2 text-sm bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
                                <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                                <span className="font-semibold text-foreground truncate">
                                    {metaConfig.facebookPageName || metaConfig.facebookPageId || "דף עסקי"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
                                <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                                <span className="font-semibold text-foreground truncate">
                                    {metaConfig.instagramUsername ? "@" + metaConfig.instagramUsername : metaConfig.instagramAccountId ? "חשבון מחובר" : "לא נמצא חשבון מקושר"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <Button variant="link" className="px-0 h-auto text-xs text-muted-foreground" onClick={() => setIsGuideOpen(true)}>
                                    איך פוסטים עולים?
                                </Button>
                                <Button
                                    onClick={handleDisconnectMeta}
                                    disabled={isDisconnecting}
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-xl border-red-200 text-red-600 dark:border-red-900/50 hover:bg-red-50 gap-1.5 text-xs font-semibold"
                                >
                                    <Unlink size={14} />
                                    {isDisconnecting ? "מנתק..." : "ניתוק חיבור"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 pt-3 border-t border-border/40">
                            <p className="text-xs text-muted-foreground">
                                חיבור חשבון הפייסבוק והאינסטגרם שלך יאפשר ל-Golda לפרסם פוסטים, להגיב להודעות ולמשוך לידים ישירות ל-CRM.
                            </p>
                            <Button
                                onClick={handleConnectMeta}
                                disabled={isConnecting}
                                size="sm"
                                className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs shadow-sm"
                            >
                                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook size={16} />}
                                {isConnecting ? "מעביר ל-Meta..." : "התחבר אל Meta"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Guide Dialog */}
            <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl p-6 gap-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Sparkles className="text-primary" size={24} />
                            איך עובד החיבור אל Meta?
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 text-sm">
                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground">1. חיבור החשבונות</h4>
                            <p className="text-muted-foreground">
                                כשתלחצו על כפתור ההתחברות, תועברו לעמוד מאובטח של Meta. אשרו את ההרשאות הנדרשות עבור דף הפייסבוק וחשבון האינסטגרם העסקי שלכם.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground">2. פרסום פוסטים</h4>
                            <p className="text-muted-foreground">
                                ברגע שהחשבון מחובר, פוסטים שתאשרו במערכת יפורסמו ישירות לדף הפייסבוק העסקי שלכם.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-bold text-foreground">3. אינסטגרם (שימו לב!)</h4>
                            <p className="text-muted-foreground">
                                כדי שהפוסטים יפורסמו גם באינסטגרם, עליכם לוודא שחשבון האינסטגרם שלכם מוגדר כ-<strong>"חשבון עסקי"</strong> או <strong>"חשבון יוצר"</strong> ומקושר לדף הפייסבוק שלכם במרכז ניהול העסקים של Meta.
                            </p>
                        </div>

                        {/* Security notice */}
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                                <strong>פרטיות ואבטחה:</strong> איננו שומרים סיסמאות. אנו משתמשים באסימון גישה מאובטח (Token) שמאפשר לנו לפעול בשמכם, וניתן לנתק אותו בכל עת.
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between flex-row-reverse border-t border-border pt-4">
                        {!metaConfig?.isConnected && (
                            <Button
                                onClick={handleConnectMeta}
                                disabled={isConnecting}
                                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm font-semibold"
                            >
                                {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Facebook size={16} />}
                                {isConnecting ? "מעביר ל-Meta..." : "התחבר אל Meta"}
                            </Button>
                        )}
                        <Button
                            onClick={() => setIsGuideOpen(false)}
                            variant="outline"
                            className="rounded-2xl border-border text-foreground hover:bg-accent"
                        >
                            הבנתי
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
