"use client";

import React, { useState, useEffect } from "react";
import InsightCard from "@/components/dashboard/InsightCard";
import IntegrationsHealth from "@/components/dashboard/IntegrationsHealth";
import PushBroadcastCard from "./marketing/PushBroadcastCard";
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
    const [maxWords, setMaxWords] = useState(100);
    const [includeEmojis, setIncludeEmojis] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
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
                    maxWords,
                    includeEmojis,
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


            {/* INTEGRATIONS HEALTH */}
            <IntegrationsHealth metaConfig={metaConfig} setMetaConfig={setMetaConfig} />

            {/* --- PUSH NOTIFICATIONS BAR --- */}
            <FeatureGate currentTier={effectiveTier} requiredFeature="PUSH_MARKETING_BROADCAST">
                <PushBroadcastCard />
            </FeatureGate>

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

                    {/* Generator Controls */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-border">
                        <div className="flex flex-wrap items-center justify-between gap-6">
                            <div className="flex flex-wrap items-center gap-6">
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

                                <div className="flex items-center gap-3">
                                    <Switch
                                        id="include-emojis"
                                        checked={includeEmojis}
                                        onCheckedChange={(checked: boolean) => setIncludeEmojis(checked)}
                                        disabled={isGenerating}
                                    />
                                    <Label htmlFor="include-emojis" className="text-sm font-medium cursor-pointer">
                                        כלול אימוג'ים
                                    </Label>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Label htmlFor="max-words" className="text-sm font-medium">
                                    מקסימום מילים:
                                </Label>
                                <Input
                                    id="max-words"
                                    type="number"
                                    min={10}
                                    max={500}
                                    className="w-24 text-center bg-background"
                                    value={maxWords}
                                    onChange={(e) => setMaxWords(parseInt(e.target.value) || 100)}
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>
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
</div>
    );
}
