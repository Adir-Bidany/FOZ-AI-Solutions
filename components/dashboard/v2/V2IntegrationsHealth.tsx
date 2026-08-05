"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Wifi,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type IntegrationStatus = "connected" | "disconnected" | "warning";

interface Integration {
    id: string;
    name: string;
    nameHe: string;
    description: string;
    status: IntegrationStatus;
    lastSync?: string;
    actionLabel?: string;
    actionHref?: string;
    logoChar: string;
    logoBg: string;
    logoColor: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
    {
        id: "meta",
        name: "Meta",
        nameHe: "מטא",
        description: "Facebook & Instagram Ads",
        status: "connected",
        lastSync: "לפני 12 דקות",
        logoChar: "f",
        logoBg: "bg-blue-600",
        logoColor: "text-white",
    },
    {
        id: "whatsapp",
        name: "WhatsApp",
        nameHe: "וואטסאפ",
        description: "Business Messaging",
        status: "connected",
        lastSync: "פעיל עכשיו",
        logoChar: "W",
        logoBg: "bg-emerald-500",
        logoColor: "text-white",
    },
    {
        id: "simplybook",
        name: "SimplyBook",
        nameHe: "SimplyBook",
        description: "Online Booking System",
        status: "warning",
        lastSync: "לפני 3 שעות",
        actionLabel: "חבר מחדש",
        actionHref: "/dashboard/settings",
        logoChar: "S",
        logoBg: "bg-orange-500",
        logoColor: "text-white",
    },
    {
        id: "google",
        name: "Google Calendar",
        nameHe: "גוגל קלנדר",
        description: "Calendar Sync",
        status: "disconnected",
        actionLabel: "חבר",
        actionHref: "/dashboard/settings",
        logoChar: "G",
        logoBg: "bg-red-500",
        logoColor: "text-white",
    },
];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    IntegrationStatus,
    { icon: React.ElementType; dotColor: string; labelColor: string; label: string; cardBorder: string }
> = {
    connected: {
        icon: CheckCircle2,
        dotColor: "bg-emerald-500",
        labelColor: "text-emerald-600 dark:text-emerald-400",
        label: "מחובר",
        cardBorder: "border-border hover:border-emerald-500/30",
    },
    warning: {
        icon: AlertCircle,
        dotColor: "bg-amber-500",
        labelColor: "text-amber-600 dark:text-amber-400",
        label: "דורש תשומת לב",
        cardBorder: "border-amber-500/30 hover:border-amber-500/50",
    },
    disconnected: {
        icon: AlertCircle,
        dotColor: "bg-red-500",
        labelColor: "text-red-600 dark:text-red-400",
        label: "לא מחובר",
        cardBorder: "border-red-500/20 hover:border-red-500/40",
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function V2IntegrationsHealth() {
    const [refreshingId, setRefreshingId] = useState<string | null>(null);

    const handleRefresh = (id: string) => {
        setRefreshingId(id);
        setTimeout(() => setRefreshingId(null), 1800);
    };

    const connectedCount = INTEGRATIONS.filter((i) => i.status === "connected").length;

    return (
        <section id="v2-integrations-health" aria-label="בריאות אינטגרציות">

            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-xl font-extrabold text-foreground tracking-tight leading-none">
                            מצב חיבורים
                        </h2>
                     
                    </div>
                </div>

                {/* Summary pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-foreground">
                        {connectedCount}/{INTEGRATIONS.length} מחוברים
                    </span>
                </div>
            </div>

            {/* Integration cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {INTEGRATIONS.map((integration) => {
                    const status = STATUS_CONFIG[integration.status];
                    const StatusIcon = status.icon;
                    const isRefreshing = refreshingId === integration.id;

                    return (
                        <div
                            key={integration.id}
                            id={`integration-${integration.id}`}
                            className={`
                                group bg-card border rounded-2xl p-4 shadow-sm
                                hover:shadow-md transition-all duration-300
                                ${status.cardBorder}
                            `}
                        >
                            {/* Top row: logo + status dot */}
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${integration.logoBg} flex items-center justify-center shadow-sm font-black text-base ${integration.logoColor}`}>
                                    {integration.logoChar}
                                </div>

                                {/* Status indicator */}
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${status.dotColor} ${integration.status !== "connected" ? "animate-pulse" : ""}`} />
                                    <StatusIcon className={`w-3.5 h-3.5 ${status.labelColor}`} />
                                </div>
                            </div>

                            {/* Name + description */}
                            <h3 className="text-sm font-bold text-foreground leading-none mb-0.5">
                                {integration.nameHe}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mb-3">
                                {integration.description}
                            </p>

                            {/* Status label + last sync */}
                            <div className={`text-[11px] font-bold ${status.labelColor} mb-1`}>
                                {status.label}
                            </div>
                            {integration.lastSync && (
                                <p className="text-[11px] text-muted-foreground">
                                    סנכרון: {integration.lastSync}
                                </p>
                            )}

                            {/* Action row */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                                {integration.actionLabel ? (
                                    <a
                                        href={integration.actionHref || "/dashboard/settings"}
                                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                                            integration.status === "disconnected"
                                                ? "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20"
                                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                                        }`}
                                    >
                                        {integration.actionLabel}
                                    </a>
                                ) : (
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        פעיל
                                    </span>
                                )}

                                <button
                                    onClick={() => handleRefresh(integration.id)}
                                    disabled={isRefreshing}
                                    title="רענן סטטוס"
                                    aria-label={`רענן סטטוס ${integration.nameHe}`}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
