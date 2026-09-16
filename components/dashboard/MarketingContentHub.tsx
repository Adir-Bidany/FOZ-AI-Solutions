"use client";

import React, { useState, useEffect } from "react";
import InsightCard from "@/components/dashboard/InsightCard";
import {
    Sparkles,
    ImageIcon,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Facebook,
    Instagram,
    HelpCircle,
    Unlink,
    ShieldCheck,
    Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import FeatureGate from "@/components/dashboard/FeatureGate";
import { type SubscriptionTier } from "@/lib/config/tiers";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface MarketingContentHubProps {
    initialInsights: any[];
    initialMetaConfig?: {
        accessToken?: string;
        facebookPageId?: string;
        facebookPageName?: string;
        instagramAccountId?: string;
        instagramUsername?: string;
        isConnected?: boolean;
    } | null;
}

export default function MarketingContentHub({
    initialInsights,
    initialMetaConfig = null,
}: MarketingContentHubProps) {
    const { data: session } = useSession();
    const effectiveTier = (session?.user?.effectiveTier as SubscriptionTier) ?? "basic";

    const [insightsList, setInsightsList] = useState<any[]>(initialInsights);
    const [metaConfig, setMetaConfig] = useState<any>(initialMetaConfig);

    // Generator State
    const [promptText, setPromptText] = useState("");
    const [includeImage, setIncludeImage] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Guide Modal State
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    // Check URL parameters for OAuth status
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("meta_connected") === "true") {
            toast.success("חשבון Meta (פייסבוק ואינסטגרם) חוברו בהצלחה!");
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (params.get("error")) {
            const errCode = params.get("error");
            const errMap: Record<string, string> = {
                MISSING_META_KEYS: "מפתח Facebook App ID לא מוגדר בשרת (.env.local)",
                META_AUTH_CANCELED: "התחברות Meta בוטלה.",
                NO_FACEBOOK_PAGE_FOUND: "לא נמצא עמוד פייסבוק מחובר לחשבון Meta שלך.",
                TOKEN_EXCHANGE_FAILED: "שגיאה באימות מול Meta.",
            };
            toast.error((errCode && errMap[errCode]) || "תקלה בחיבור לחשבון Meta.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleConnectMeta = () => {
        window.location.href = "/api/integrations/meta/connect";
    };

    const handleDisconnectMeta = async () => {
        if (!confirm("האם ברצונך לנתק את החיבור לעמוד הפייסבוק והאינסטגרם?")) return;

        setIsDisconnecting(true);
        try {
            const res = await fetch("/api/integrations/meta/disconnect", { method: "DELETE" });
            if (res.ok) {
                setMetaConfig(null);
                toast.success("חשבון Meta נותק בהצלחה.");
            } else {
                toast.error("תקלה בניתוק החשבון.");
            }
        } catch (error) {
            console.error(error);
            toast.error("תקלה בחיבור לשרת.");
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleGeneratePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isGenerating) return;

        setIsGenerating(true);
        try {
            const res = await fetch("/api/marketing/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: promptText,
                    includeImage,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "תקלה במחולל הפוסטים.");
                return;
            }

            if (data.success && data.insight) {
                setInsightsList((prev) => [data.insight, ...prev]);
                setPromptText("");
                if (includeImage && data.imageGenerated) {
                    toast.success("פוסט שיווקי + תמונת AI יוצרו בהצלחה!");
                } else {
                    toast.success("פוסט שיווקי נוצר בהצלחה!");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("תקלה בחיבור לשרת.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* --- META INTEGRATIONS BANNER --- */}
            <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                            <Facebook className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-foreground">חיבור רשתות חברתיות (Meta)</h3>
                                {metaConfig?.isConnected ? (
                                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                        <CheckCircle2 size={12} /> מחובר ל-Meta
                                    </span>
                                ) : (
                                    <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                                        <AlertCircle size={12} /> לא מחובר
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                פרסם פוסטים ותמונות AI בלחיצת כפתור ישירות לעמוד הפייסבוק והאינסטגרם של העסק
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Button
                            onClick={() => setIsGuideOpen(true)}
                            variant="outline"
                            size="sm"
                            className="rounded-2xl border-border text-foreground hover:bg-accent gap-1.5 text-xs font-semibold"
                        >
                            <HelpCircle size={14} className="text-primary" />
                            איך מתחברים? (מדריך קצר)
                        </Button>

                        {metaConfig?.isConnected ? (
                            <Button
                                onClick={handleDisconnectMeta}
                                disabled={isDisconnecting}
                                variant="outline"
                                size="sm"
                                className="rounded-2xl border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5 text-xs font-semibold"
                            >
                                <Unlink size={14} />
                                {isDisconnecting ? "מנתק..." : "נתק חשבון Meta"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleConnectMeta}
                                size="sm"
                                className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs shadow-sm"
                            >
                                <Facebook size={14} />
                                התחבר לחשבון Meta
                            </Button>
                        )}
                    </div>
                </div>

                {/* Account Details if connected */}
                {metaConfig?.isConnected && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/50 text-xs">
                        <div className="flex items-center gap-2 bg-muted/40 px-3.5 py-2 rounded-2xl border border-border">
                            <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-muted-foreground">עמוד פייסבוק:</span>
                            <span className="font-bold text-foreground truncate">
                                {metaConfig.facebookPageName || metaConfig.facebookPageId || "מחובר"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 bg-muted/40 px-3.5 py-2 rounded-2xl border border-border">
                            <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                            <span className="text-muted-foreground">אינסטגרם עסקי:</span>
                            <span className="font-bold text-foreground truncate">
                                {metaConfig.instagramUsername ? `@${metaConfig.instagramUsername}` : metaConfig.instagramAccountId ? "מחובר" : "לא מקושר לעמוד"}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* --- AI POST GENERATOR BAR --- */}
            <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">מחולל הפוסטים של גולדה</h3>
                            <p className="text-xs text-muted-foreground">צור פוסטים שיווקיים ותמונות AI בלחיצת כפתור</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleGeneratePost} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            placeholder="על מה תרצה לכתוב? (לדוגמה: מבצע חבילת אביב לטיפולי פנים)..."
                            className="flex-1 h-12 rounded-2xl border-border bg-background px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                        />
                        <Button
                            type="submit"
                            disabled={isGenerating}
                            className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shrink-0 gap-2 shadow-sm"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    מייצר פוסט...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    מחולל פוסט שיווקי
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Include AI Image Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <FeatureGate
                            currentTier={effectiveTier}
                            requiredFeature="AI_IMAGE_GENERATOR"
                            fallback={
                                <div className="flex items-center gap-3 opacity-70">
                                    <Switch
                                        id="include-image-locked"
                                        checked={false}
                                        disabled={true}
                                    />
                                    <Label htmlFor="include-image-locked" className="text-sm font-medium flex items-center gap-2 cursor-not-allowed">
                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                        כלול תמונת AI מותאמת אישית
                                        <Lock className="ml-2 text-muted-foreground" size={14} />
                                    </Label>
                                </div>
                            }
                        >
                            <div className="flex items-center gap-3">
                                <Switch
                                    id="include-image"
                                    checked={includeImage}
                                    onCheckedChange={(checked: boolean) => setIncludeImage(checked)}
                                    disabled={isGenerating}
                                />
                                <Label htmlFor="include-image" className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                    כלול תמונת AI מותאמת אישית
                                </Label>
                            </div>
                        </FeatureGate>
                    </div>
                </form>
            </div>

            {/* --- UNIFIED MARKETING POSTS FEED --- */}
            {insightsList.length === 0 ? (
                <div className="bg-card rounded-3xl p-12 border border-dashed border-border text-center flex flex-col items-center justify-center text-muted-foreground h-64 shadow-sm">
                    <Sparkles className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-foreground mb-1">עדיין אין פוסטים שיווקיים</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        השתמש במחולל הפוסטים למעלה כדי ליצור פוסטים ותמונות AI עבור העסק שלך.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-primary" size={20} />
                        <h3 className="text-lg font-bold text-foreground">הפוסטים השיווקיים שלך ({insightsList.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {insightsList.map((insight) => (
                            <InsightCard
                                key={insight._id}
                                id={insight._id}
                                title={insight.title}
                                content={insight.content}
                                imageUrl={insight.imageUrl}
                                type={insight.type}
                                date={insight.createdAt}
                                agentName="Golda"
                                status={insight.status}
                                onDeleted={(deletedId) => setInsightsList((prev) => prev.filter((i) => i._id !== deletedId))}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* --- HOW TO CONNECT GUIDE MODAL --- */}
            <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogContent className="sm:max-w-xl dir-rtl text-right rounded-3xl p-6 bg-card text-foreground border border-border" dir="rtl">
                    <DialogHeader className="text-right pb-3 border-b border-border">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                <Facebook size={16} />
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
                                מדריך חיבור Meta & Instagram
                            </span>
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground mt-1">
                            איך לחבר את עמוד הפייסבוק והאינסטגרם של העסק?
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            עקוב אחר 3 הצעדים הפשוטים כדי לאפשר לגולדה לפרסם תוכן שיווקי באופן ישיר
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 text-sm max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {/* Step 1 */}
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                            <div className="flex items-center gap-2 font-bold text-foreground">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center border border-primary/20 shrink-0">1</span>
                                <span>וידוא קישור חשבון אינסטגרם עסקי לעמוד הפייסבוק</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed pr-8">
                                ודא שחשבון האינסטגרם של העסק מוגדר כ-<strong>Professional/Business Account</strong> ומקושר לעמוד הפייסבוק העסקי שלך דרך <strong>Meta Business Suite</strong> או בהגדרות האינסטגרם בנייד.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                            <div className="flex items-center gap-2 font-bold text-foreground">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center border border-primary/20 shrink-0">2</span>
                                <span>התחברות ומתן הרשאות פרסום מול Meta</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed pr-8">
                                לחץ על הכפתור <strong>"התחבר לחשבון Meta"</strong> למעלה. בחלון של פייסבוק שיפתח, בחר את עמוד הפייסבוק וחשבון האינסטגרם שברצונך לחבר ואשר את הרשאות הפרסום.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                            <div className="flex items-center gap-2 font-bold text-foreground">
                                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center border border-primary/20 shrink-0">3</span>
                                <span>פרסום פוסטים ותמונות AI בלחיצת כפתור</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed pr-8">
                                לאחר החיבור, בכל כרטיס פוסט מאושר יופיעו כפתורי <strong>"פרסם בפייסבוק"</strong> ו-<strong>"פרסם באינסטגרם"</strong> לפרסום מיידי!
                            </p>
                        </div>

                        {/* Security notice */}
                        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>
                                <strong>אבטחה ופרטיות:</strong> המערכת תפרסם פוסטים אך ורק בעקבות לחיצה מפורשת שלך על כפתור הפרסום. שום פוסט לא יפורסם ללא אישורך.
                            </span>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between flex-row-reverse border-t border-border pt-4">
                        <Button
                            onClick={handleConnectMeta}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm font-semibold"
                        >
                            <Facebook size={16} />
                            התחבר כעת לחשבון Meta
                        </Button>
                        <Button
                            onClick={() => setIsGuideOpen(false)}
                            variant="outline"
                            className="rounded-2xl border-border text-foreground hover:bg-accent"
                        >
                            סגור
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
