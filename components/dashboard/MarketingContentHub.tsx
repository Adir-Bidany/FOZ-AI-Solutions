"use client";

import React, { useState, useEffect } from "react";
import PendingAssetCard from "@/components/dashboard/PendingAssetCard";
import InsightCard from "@/components/dashboard/InsightCard";
import { Sparkles, MessageSquare, Clock, ImageIcon, Loader2, Image as ImageLucide, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MarketingContentHubProps {
    initialPendingAssets: any[];
    approvedInsights: any[];
}

export default function MarketingContentHub({
    initialPendingAssets,
    approvedInsights: initialApprovedInsights,
}: MarketingContentHubProps) {
    const [pendingAssets, setPendingAssets] = useState<any[]>(initialPendingAssets);
    const [insightsList, setInsightsList] = useState<any[]>(initialApprovedInsights);

    // Generator State
    const [promptText, setPromptText] = useState("");
    const [includeImage, setIncludeImage] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Quota State
    const [canGenerateImage, setCanGenerateImage] = useState<boolean>(true);
    const [isCheckingQuota, setIsCheckingQuota] = useState(true);

    // Fetch initial quota status on mount
    useEffect(() => {
        const checkQuota = async () => {
            try {
                const res = await fetch("/api/marketing/generate");
                if (res.ok) {
                    const data = await res.json();
                    setCanGenerateImage(data.canGenerateImage);
                    if (!data.canGenerateImage) {
                        setIncludeImage(false);
                    }
                }
            } catch (err) {
                console.error("Failed to check image quota", err);
            } finally {
                setIsCheckingQuota(false);
            }
        };
        checkQuota();
    }, []);

    const handlePendingDeleted = (deletedId: string) => {
        setPendingAssets((prev) => prev.filter((item) => item._id !== deletedId));
    };

    const handleGeneratePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isGenerating) return;

        if (includeImage && !canGenerateImage) {
            toast.error("נוצלה מכסת התמונות היומית. נסה שוב מחר.");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch("/api/marketing/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: promptText,
                    includeImage: includeImage && canGenerateImage,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === "DAILY_IMAGE_QUOTA_REACHED") {
                    setCanGenerateImage(false);
                    setIncludeImage(false);
                    toast.error(data.message || "נוצלה מכסת התמונות היומית.");
                } else {
                    toast.error(data.error || "תקלה מחולל הפוסטים.");
                }
                return;
            }

            if (data.success && data.insight) {
                setInsightsList((prev) => [data.insight, ...prev]);
                setPromptText("");
                if (includeImage) {
                    setCanGenerateImage(false);
                    setIncludeImage(false);
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
            {/* --- AI POST GENERATOR BAR --- */}
            <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">מחולל הפוסטים של גולדה (Golda AI)</h3>
                            <p className="text-xs text-muted-foreground">צור פוסטים שיווקיים ותמונות AI בלחיצת כפתור</p>
                        </div>
                    </div>

                    {/* Daily Quota Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/60 px-3 py-1.5 rounded-full border border-border text-xs">
                        <ImageLucide className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">מכסת תמונות יומיות:</span>
                        {canGenerateImage ? (
                            <span className="text-emerald-600 font-bold dark:text-emerald-400">1 / 1 זמינה</span>
                        ) : (
                            <span className="text-amber-600 font-bold dark:text-amber-400">0 / 1 (נוצלה להיום)</span>
                        )}
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

                    {/* Include AI Image Toggle & Tooltip */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="include-image"
                                checked={includeImage && canGenerateImage}
                                onCheckedChange={(checked: boolean) => {
                                    if (canGenerateImage) {
                                        setIncludeImage(checked);
                                    } else {
                                        toast.error("נוצלה מכסת התמונות היומית (תמונה 1 ביום בלבד). נסה שוב מחר.");
                                    }
                                }}
                                disabled={!canGenerateImage || isGenerating}
                            />
                            <Label htmlFor="include-image" className={`text-sm font-medium flex items-center gap-2 ${!canGenerateImage ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                <ImageIcon className="w-4 h-4 text-primary" />
                                כלול תמונת AI מותאמת אישית (Imagen 3)
                            </Label>
                        </div>

                        {!canGenerateImage && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/50">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>נוצלה מכסת התמונות היומית. נסה שוב מחר.</span>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* --- CONTENT CARDS SECTION --- */}
            {pendingAssets.length === 0 && insightsList.length === 0 ? (
                <div className="bg-card rounded-3xl p-12 border border-dashed border-border text-center flex flex-col items-center justify-center text-muted-foreground h-64 shadow-sm">
                    <Sparkles className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-foreground mb-1">עדיין אין פוסטים שיווקיים</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        השתמש במחולל הפוסטים למעלה כדי ליצור פוסטים ותמונות AI עבור העסק שלך.
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Pending Approvals Section */}
                    {pendingAssets.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Clock className="text-amber-500" size={20} />
                                <h3 className="text-lg font-bold text-foreground">
                                    הצעות שיווקיות ממתינות לאישור שלך ({pendingAssets.length})
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                {pendingAssets.map((asset) => (
                                    <PendingAssetCard
                                        key={asset._id}
                                        id={asset._id}
                                        title={asset.title}
                                        content={asset.content}
                                        type={asset.type}
                                        date={asset.createdAt}
                                        onDeleted={handlePendingDeleted}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Approved Insights & Posts Section */}
                    {insightsList.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-primary" size={20} />
                                <h3 className="text-lg font-bold text-foreground">תוכן שיווקי מאושר ופוסטים</h3>
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
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
