"use client";

import React, { useState, useEffect } from "react";
import V2ActionCenter from "./V2ActionCenter";
import V2HeroMetrics from "./V2HeroMetrics";
import V2IntegrationsHealth from "./V2IntegrationsHealth";
import V2AgentInsightsFeed from "./V2AgentInsightsFeed";
import V2SystemAuditLog from "./V2SystemAuditLog";
import GoldaModal from "./GoldaModal";

interface ActionCard {
    _id: string;
    source_agent?: string;
    status: string;
    priority?: string;
    display_content: {
        title: string;
        description: string;
        icon?: string;
    };
    created_at?: string;
}

interface DashboardV2ShellProps {
    businessId: string;
    firstName: string;
    businessName: string;
    initialCards: ActionCard[];
}

export default function DashboardV2Shell({
    businessId,
    firstName,
    businessName,
    initialCards,
}: DashboardV2ShellProps) {
    const [isGoldaOpen, setIsGoldaOpen] = useState(false);
    const [cards, setCards] = useState<ActionCard[]>(initialCards);

    // Listen to global open-golda-modal event triggered from floating menu or sidebar
    useEffect(() => {
        const handleOpenGolda = () => {
            setIsGoldaOpen(true);
        };
        window.addEventListener("open-golda-modal", handleOpenGolda);
        return () => window.removeEventListener("open-golda-modal", handleOpenGolda);
    }, []);

    return (
        <div className="relative min-h-full pb-32" dir="rtl">

            {/* ─── Main Page Content ─── */}
            <div className="px-4 lg:px-8 pt-8 md:pt-10 space-y-10">

                {/* ══════════════════════════════════════════════
                    SECTION 1 — Agent Action Center (מרכז הפעולות)
                    First component on page right below Global Header
                ══════════════════════════════════════════════ */}
                <V2ActionCenter
                    businessId={businessId}
                    initialCards={initialCards}
                    onCardsChange={setCards}
                />

                {/* ══════════════════════════════════════════════
                    SECTION 2 — Hero Metrics (4 KPI cards)
                ══════════════════════════════════════════════ */}
                <V2HeroMetrics />

                {/* ══════════════════════════════════════════════
                    SECTION 3 — Integrations Health
                ══════════════════════════════════════════════ */}
                <V2IntegrationsHealth />

                {/* ══════════════════════════════════════════════
                    SECTION 4 — Agent Insights Feed
                ══════════════════════════════════════════════ */}
                <V2AgentInsightsFeed />

                {/* ══════════════════════════════════════════════
                    SECTION 5 — System Audit Log
                ══════════════════════════════════════════════ */}
                <V2SystemAuditLog />
            </div>

            {/* ─── Golda Popup Modal ─── */}
            <GoldaModal
                isOpen={isGoldaOpen}
                onClose={() => setIsGoldaOpen(false)}
                businessId={businessId}
            />
        </div>
    );
}
