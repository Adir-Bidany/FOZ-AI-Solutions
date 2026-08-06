"use client";

import React, { useState, useEffect } from "react";
import ActionCenter from "./ActionCenter";
import HeroMetrics from "./HeroMetrics";
import IntegrationsHealth from "./IntegrationsHealth";
import AgentInsightsFeed from "./AgentInsightsFeed";
import SystemAuditLog from "./SystemAuditLog";
import GoldaModal from "./GoldaModal";
import LeadManager from "./LeadManager";
import AnalyticsSection from "./AnalyticsSection";

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

interface DashboardShellProps {
    businessId: string;
    firstName: string;
    businessName: string;
    initialCards: ActionCard[];
}

export default function DashboardShell({
    businessId,
    firstName,
    businessName,
    initialCards,
}: DashboardShellProps) {
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
                <ActionCenter
                    businessId={businessId}
                    initialCards={initialCards}
                    onCardsChange={setCards}
                />

                {/* ══════════════════════════════════════════════
                    SECTION 1.5 — Lead Manager (ניהול פניות ולידים)
                ══════════════════════════════════════════════ */}
                <LeadManager businessId={businessId} />

                {/* ══════════════════════════════════════════════
                    SECTION 2 — Hero Metrics (4 KPI cards)
                ══════════════════════════════════════════════ */}
                <HeroMetrics />

                {/* ══════════════════════════════════════════════
                    SECTION 3 — Integrations Health
                ══════════════════════════════════════════════ */}
                <IntegrationsHealth />

                {/* ══════════════════════════════════════════════
                    SECTION 4 — Agent Insights Feed
                ══════════════════════════════════════════════ */}
                <AgentInsightsFeed />

                {/* ══════════════════════════════════════════════
                    SECTION 5 — System Audit Log
                ══════════════════════════════════════════════ */}
                <SystemAuditLog />

                {/* ══════════════════════════════════════════════
                    SECTION 6 — Analytics & CSV Export
                ══════════════════════════════════════════════ */}
                <AnalyticsSection />
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
