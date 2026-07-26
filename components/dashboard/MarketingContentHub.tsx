"use client";

import React, { useState } from "react";
import PendingAssetCard from "@/components/dashboard/PendingAssetCard";
import InsightCard from "@/components/dashboard/InsightCard";
import { Sparkles, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MarketingContentHubProps {
    initialPendingAssets: any[];
    approvedInsights: any[];
}

export default function MarketingContentHub({
    initialPendingAssets,
    approvedInsights,
}: MarketingContentHubProps) {
    const [pendingAssets, setPendingAssets] = useState<any[]>(initialPendingAssets);

    const handlePendingDeleted = (deletedId: string) => {
        setPendingAssets((prev) => prev.filter((item) => item._id !== deletedId));
    };

    const hasAnyContent = pendingAssets.length > 0 || approvedInsights.length > 0;

    if (!hasAnyContent) {
        return (
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-3xl p-12 border border-dashed border-indigo-200 text-center flex flex-col items-center justify-center text-gray-500 h-[28rem] shadow-sm">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">מרכז התוכן שלך עדיין ריק</h3>
                <p className="text-base mt-2 max-w-md text-gray-500 leading-relaxed">
                    הפוסטים השיווקיים, רעיונות לקמפיינים והטיפים שגולדה תייצר עבורך יופיעו כאן לאחר אישור.
                </p>
                <Link href="/dashboard" className="mt-8">
                    <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl px-6">
                        <MessageSquare size={18} /> התחילי שיחה עכשיו
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Pending Approvals Section */}
            {pendingAssets.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="text-fuchsia-600" size={20} />
                        <h3 className="text-lg font-bold text-gray-900">
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

            {/* Approved Insights Section */}
            {approvedInsights.length > 0 && (
                <div className="space-y-4">
                    {pendingAssets.length > 0 && (
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            <Sparkles className="text-pink-500" size={20} />
                            <h3 className="text-lg font-bold text-gray-900">תוכן שיווקי מאושר ופעיל</h3>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                        {approvedInsights.map((insight) => (
                            <InsightCard
                                key={insight._id}
                                id={insight._id}
                                title={insight.title}
                                content={insight.content}
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
    );
}
