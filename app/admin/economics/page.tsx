"use client";

import React, { useState, useEffect } from "react";
import GlobalHeader from "@/components/GlobalHeader";
import PromptCMSFAB from "@/components/admin/PromptCMSFAB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Zap,
    DollarSign,
    Flame,
    Search,
    TrendingUp,
    MessageSquare,
    Building2,
    Loader2,
    RefreshCw,
    AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TenantMetrics {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    slug: string;
    totalChats: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUSD: number;
    costILS: number;
}

interface EconomicsData {
    metrics: {
        totalBusinesses: number;
        activeTokenBusinesses: number;
        overallChats: number;
        overallPromptTokens: number;
        overallCompletionTokens: number;
        overallTotalTokens: number;
        totalCostUSD: number;
        totalCostILS: number;
        avgTokensPerChat: number;
    };
    noisyNeighbors: TenantMetrics[];
    tenantBreakdown: TenantMetrics[];
}

export default function AdminEconomicsPage() {
    const [data, setData] = useState<EconomicsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchEconomics = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/economics");
            if (!res.ok) throw new Error("Failed to fetch economics metrics");
            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (error) {
            console.error("Economics fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEconomics();
    }, []);

    const filteredTenants = data?.tenantBreakdown.filter(
        (t) =>
            t.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.slug.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const formatNumber = (num: number) => num.toLocaleString("he-IL");

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 font-sans" dir="rtl">
            <GlobalHeader />

            <main className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-10">
                {/* Header Title Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                            <Zap className="text-amber-500 w-8 h-8 animate-pulse" />
                            כלכלת AI וצריכת אסימונים (Tokens)
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            מעקב בזמן אמת על צריכת אסימונים (Tokens), עלויות דגם Gemini 2.5 Flash, וזיהוי "שכנים רועשים" (Noisy Neighbors)
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={fetchEconomics}
                        disabled={isLoading}
                        className="bg-card border-border hover:bg-accent text-foreground gap-2 rounded-2xl text-xs font-bold"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                        רענן נתונים
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">מחשב צריכת אסימונים ועלויות דגם Gemini...</p>
                    </div>
                ) : !data ? (
                    <div className="p-12 text-center text-muted-foreground border border-dashed rounded-3xl">
                        לא ניתן לטעון נתוני כלכלה כעת.
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* North Star Metric Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Metric 1: Total Tokens */}
                            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-3 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">סה״כ אסימונים שנצרכו</span>
                                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                                        {formatNumber(data.metrics.overallTotalTokens)}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-mono">
                                        <span>קלט: {formatNumber(data.metrics.overallPromptTokens)}</span>
                                        <span>•</span>
                                        <span>פלט: {formatNumber(data.metrics.overallCompletionTokens)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Metric 2: Estimated Cost */}
                            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-3 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">עלות מוערכת (Gemini 2.5 Flash)</span>
                                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-baseline gap-2">
                                        <span>${data.metrics.totalCostUSD}</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            (₪{formatNumber(data.metrics.totalCostILS)})
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                                        $0.075 / 1M קלט • $0.30 / 1M פלט
                                    </div>
                                </div>
                            </div>

                            {/* Metric 3: Avg Tokens per Chat */}
                            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-3 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">ממוצע אסימונים לשיחה</span>
                                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                                        {formatNumber(data.metrics.avgTokensPerChat)}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-1">
                                        מבוסס על {formatNumber(data.metrics.overallChats)} שיחות כולל במערכת
                                    </div>
                                </div>
                            </div>

                            {/* Metric 4: Active Token Businesses */}
                            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-3 relative overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">עסקים פעילים בצריכה</span>
                                    <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                                        {data.metrics.activeTokenBusinesses} / {data.metrics.totalBusinesses}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-1">
                                        עסקים שהשתמשו בסוכני AI בשאילתות אמת
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top 5 Noisy Neighbors Section */}
                        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                        <Flame className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg text-foreground flex items-center gap-2">
                                            Top 5 "שכנים רועשים" (Noisy Neighbors)
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            העסקים עם צריכת האסימונים הגבוהה ביותר במערכת
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {data.noisyNeighbors.map((tenant, idx) => {
                                    const percentage = data.metrics.overallTotalTokens > 0
                                        ? Math.round((tenant.totalTokens / data.metrics.overallTotalTokens) * 100)
                                        : 0;

                                    return (
                                        <div
                                            key={tenant.id}
                                            className="bg-background border border-border/80 rounded-2xl p-4 space-y-3 relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-extrabold text-amber-500">#{idx + 1}</span>
                                                <span className="text-[11px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-bold">
                                                    {percentage}% מהסך
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-foreground truncate" title={tenant.businessName}>
                                                    {tenant.businessName}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {tenant.ownerName}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                                                    <span>{formatNumber(tenant.totalTokens)} tokens</span>
                                                    <span>${tenant.costUSD}</span>
                                                </div>
                                                <div className="w-full bg-muted/40 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-amber-500 to-rose-500 h-1.5 rounded-full"
                                                        style={{ width: `${Math.max(percentage, 4)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {data.noisyNeighbors.length === 0 && (
                                    <div className="col-span-5 p-6 text-center text-xs text-muted-foreground">
                                        אין עדיין נתוני צריכת אסימונים רשומים.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Tenant Token Breakdown Table */}
                        <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
                            <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
                                <div>
                                    <h2 className="font-bold text-lg text-foreground">
                                        פירוט צריכה לפי עסק ({filteredTenants.length})
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        מעקב שקוף של כמות שיחות, אסימונים ועלויות לכל דייר
                                    </p>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="חיפוש לפי שם עסק או בעלים..."
                                        className="pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-right">
                                    <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                        <tr>
                                            <th className="h-12 px-6 align-middle">שם העסק</th>
                                            <th className="h-12 px-6 align-middle">בעלים / אימייל</th>
                                            <th className="h-12 px-6 align-middle">כמות שיחות</th>
                                            <th className="h-12 px-6 align-middle">אסימוני קלט (Prompt)</th>
                                            <th className="h-12 px-6 align-middle">אסימוני פלט (Completion)</th>
                                            <th className="h-12 px-6 align-middle">סה״כ אסימונים</th>
                                            <th className="h-12 px-6 align-middle">עלות מוערכת ($ USD)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {filteredTenants.map((tenant) => (
                                            <tr key={tenant.id} className="transition-colors hover:bg-muted/20">
                                                <td className="p-6 font-bold text-foreground">
                                                    {tenant.businessName}
                                                </td>
                                                <td className="p-6">
                                                    <div className="font-medium text-foreground">{tenant.ownerName}</div>
                                                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{tenant.email}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold text-xs rounded-full border border-violet-500/20">
                                                        <MessageSquare className="w-3.5 h-3.5" />
                                                        <span>{formatNumber(tenant.totalChats)} שיחות</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 font-mono text-xs text-muted-foreground">
                                                    {formatNumber(tenant.promptTokens)}
                                                </td>
                                                <td className="p-6 font-mono text-xs text-muted-foreground">
                                                    {formatNumber(tenant.completionTokens)}
                                                </td>
                                                <td className="p-6 font-mono font-bold text-foreground">
                                                    {formatNumber(tenant.totalTokens)}
                                                </td>
                                                <td className="p-6 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${tenant.costUSD}
                                                    <span className="text-[11px] text-muted-foreground font-normal block">
                                                        (₪{tenant.costILS})
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredTenants.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-muted-foreground text-sm font-medium">
                                                    לא נמצאו עסקים תואמים לחיפוש.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Prompt CMS & Admin Floating Navigation Button */}
            <PromptCMSFAB />
        </div>
    );
}
