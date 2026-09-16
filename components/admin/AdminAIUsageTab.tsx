"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Zap, Flame, Building2, TrendingUp, AlertTriangle, Edit2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TenantMetrics {
    id: string;
    businessName: string;
    ownerName: string;
    totalChats: number;
    totalTokens: number;
    costUSD: number;
    costILS: number;
    ai_token_quota: number;
}

interface EconomicsData {
    metrics: {
        totalCostILS: number;
        overallTotalTokens: number;
        avgTokensPerChat: number;
    };
    tenantBreakdown: TenantMetrics[];
}

export default function AdminAIUsageTab() {
    const [data, setData] = useState<EconomicsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingQuotaId, setEditingQuotaId] = useState<string | null>(null);
    const [editQuotaValue, setEditQuotaValue] = useState<number>(0);
    const [isSavingQuota, setIsSavingQuota] = useState(false);

    useEffect(() => {
        fetchEconomics();
    }, []);

    const fetchEconomics = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/economics");
            const resData = await res.json();
            if (resData.success) {
                setData(resData);
            }
        } catch (error) {
            console.error("Failed to fetch economics metrics", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveQuota = async (tenantId: string) => {
        setIsSavingQuota(true);
        try {
            const res = await fetch(`/api/admin/clients/${tenantId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ai_token_quota: editQuotaValue }),
            });
            const updateData = await res.json();
            if (updateData.success) {
                setData((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        tenantBreakdown: prev.tenantBreakdown.map((t) =>
                            t.id === tenantId ? { ...t, ai_token_quota: editQuotaValue } : t
                        ),
                    };
                });
                setEditingQuotaId(null);
            } else {
                alert("שגיאה בעדכון מכסה");
            }
        } catch (error) {
            console.error(error);
            alert("שגיאה בעדכון מכסה");
        } finally {
            setIsSavingQuota(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>טוען נתוני צריכה ומכסות...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-sm font-bold text-muted-foreground">סה״כ עלויות (ILS)</span>
                        <div className="text-2xl font-extrabold text-foreground mt-1">₪{data.metrics.totalCostILS.toFixed(2)}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500"><TrendingUp className="w-6 h-6" /></div>
                </div>
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-sm font-bold text-muted-foreground">סה״כ טוקנים</span>
                        <div className="text-2xl font-extrabold text-foreground mt-1">{data.metrics.overallTotalTokens.toLocaleString("he-IL")}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500"><Zap className="w-6 h-6" /></div>
                </div>
                <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-sm font-bold text-muted-foreground">ממוצע טוקנים לשיחה</span>
                        <div className="text-2xl font-extrabold text-foreground mt-1">{data.metrics.avgTokensPerChat.toLocaleString("he-IL")}</div>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500"><Building2 className="w-6 h-6" /></div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/80 bg-muted/20 flex items-center gap-3">
                    <Flame className="w-5 h-5 text-rose-500" />
                    <h2 className="font-bold text-lg text-foreground">פירוט צריכה פר לקוח (Noisy Neighbors)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                            <tr>
                                <th className="px-6 py-4">עסק</th>
                                <th className="px-6 py-4">שיחות</th>
                                <th className="px-6 py-4">טוקנים שנוצלו</th>
                                <th className="px-6 py-4">עלות מוערכת</th>
                                <th className="px-6 py-4 w-64">ניצול מכסה (Quota)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {data.tenantBreakdown.map((tenant) => {
                                const quota = tenant.ai_token_quota || 500000;
                                const usagePercent = Math.min(100, Math.round((tenant.totalTokens / quota) * 100));
                                const isWarning = usagePercent >= 90;
                                const isEditing = editingQuotaId === tenant.id;

                                return (
                                    <tr key={tenant.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{tenant.businessName}</div>
                                            <div className="text-xs text-muted-foreground">{tenant.ownerName}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono">{tenant.totalChats.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono">{tenant.totalTokens.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                            ₪{tenant.costILS.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={editQuotaValue}
                                                            onChange={(e) => setEditQuotaValue(Number(e.target.value))}
                                                            className="h-8 text-xs font-mono"
                                                            min={0}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            disabled={isSavingQuota}
                                                            onClick={() => handleSaveQuota(tenant.id)}
                                                            className="h-8 px-2 bg-emerald-500 hover:bg-emerald-600"
                                                        >
                                                            {isSavingQuota ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setEditingQuotaId(null)}
                                                            className="h-8 px-2 text-muted-foreground"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="font-mono text-muted-foreground">{quota.toLocaleString()} מכסה</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingQuotaId(tenant.id);
                                                                setEditQuotaValue(quota);
                                                            }}
                                                            className="h-5 px-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isWarning ? "bg-rose-500" : "bg-purple-500"}`}
                                                            style={{ width: `${usagePercent}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-bold w-10 text-left ${isWarning ? "text-rose-500" : "text-foreground"}`}>
                                                        {usagePercent}%
                                                    </span>
                                                </div>
                                                {isWarning && (
                                                    <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold mt-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        חרג ממכסה!
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}