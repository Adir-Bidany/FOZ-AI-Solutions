"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Save, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PricingSettings {
    basic: number;
    pro: number;
    enterprise: number;
}

export default function AdminBillingTab() {
    const [pricing, setPricing] = useState<PricingSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.success && data.settings?.pricing) {
                setPricing(data.settings.pricing);
            }
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pricing) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pricing }),
            });
            const data = await res.json();
            if (data.success) {
                alert("מחירי המנויים עודכנו בהצלחה!");
                // Force a page refresh to update MRR on the parent board
                window.location.reload();
            } else {
                alert("שגיאה בעדכון המחירים: " + (data.error || ""));
            }
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("תקלה בעדכון המחירים.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>טוען נתוני כספים...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">ניהול מחירי מנויים (Dynamic Pricing)</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            המחירים שיוגדרו כאן ישפיעו ישירות על חישוב ה-MRR (הכנסה חודשית קבועה) במסך מבט-על.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Basic Tier */}
                        <div className="space-y-3 bg-muted/20 p-5 rounded-2xl border border-border">
                            <label className="text-sm font-bold text-foreground flex items-center justify-between">
                                Basic Tier
                                <span className="text-xs font-normal text-muted-foreground">₪ לחודש</span>
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={pricing?.basic || 0}
                                onChange={(e) => setPricing(prev => prev ? { ...prev, basic: Number(e.target.value) } : null)}
                                className="bg-background border-border text-lg font-bold"
                            />
                        </div>

                        {/* Pro Tier */}
                        <div className="space-y-3 bg-purple-500/5 p-5 rounded-2xl border border-purple-500/20">
                            <label className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                                Pro Tier (ברירת מחדל)
                                <span className="text-xs font-normal opacity-70">₪ לחודש</span>
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={pricing?.pro || 0}
                                onChange={(e) => setPricing(prev => prev ? { ...prev, pro: Number(e.target.value) } : null)}
                                className="bg-background border-purple-500/30 text-lg font-bold"
                            />
                        </div>

                        {/* Enterprise Tier */}
                        <div className="space-y-3 bg-amber-500/5 p-5 rounded-2xl border border-amber-500/20">
                            <label className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                                Enterprise Tier
                                <span className="text-xs font-normal opacity-70">₪ לחודש</span>
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={pricing?.enterprise || 0}
                                onChange={(e) => setPricing(prev => prev ? { ...prev, enterprise: Number(e.target.value) } : null)}
                                className="bg-background border-amber-500/30 text-lg font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            שינוי המחירים יעדכן מיידית את חישובי ההכנסות למנהלים.
                        </div>
                        <Button
                            type="submit"
                            disabled={isSaving || !pricing}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2 px-6"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            שמור שינויים
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}