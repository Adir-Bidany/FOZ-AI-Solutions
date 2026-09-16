"use client";

/**
 * components/dashboard/FeatureGate.tsx
 *
 * A wrapper component that gates UI elements behind subscription tier checks.
 *
 * Usage:
 *   <FeatureGate currentTier="basic" requiredFeature="GOLDA_CHAT">
 *     <GoldaModal />
 *   </FeatureGate>
 *
 * The children are only rendered if the tenant has access.
 * Otherwise, a polished "Upgrade Required" card is shown (or a custom fallback via `fallback` prop).
 */

import React from "react";
import { Lock, ArrowUpCircle } from "lucide-react";
import Link from "next/link";
import { type SubscriptionTier, type FeatureFlag, SUBSCRIPTION_TIERS } from "@/lib/config/tiers";
import { hasFeatureAccess, getRequiredTier } from "@/lib/utils/tierAccess";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureGateProps {
    /** The tenant's current subscription tier, pulled from their session/business data. */
    currentTier: SubscriptionTier;
    /** The feature flag to check access for. */
    requiredFeature: FeatureFlag;
    /** The content to render if the tenant has access. */
    children: React.ReactNode;
    /** Optional: custom fallback UI to render if the tenant does NOT have access. */
    fallback?: React.ReactNode;
    /**
     * Optional: if true, renders nothing at all when access is denied (instead of the upgrade card).
     * Useful for hiding sidebar links or small inline elements.
     */
    silent?: boolean;
}

// ─── Default Upgrade Card ─────────────────────────────────────────────────────

function UpgradeCard({ requiredFeature }: { requiredFeature: FeatureFlag }) {
    const requiredTier = getRequiredTier(requiredFeature);
    const tierLabel = requiredTier ? SUBSCRIPTION_TIERS[requiredTier].label : "גבוה יותר";

    return (
        <div
            dir="rtl"
            className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card p-10 text-center shadow-sm"
        >
            {/* Lock Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Lock className="h-8 w-8" />
            </div>

            {/* Headline */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                    תכונה זו דורשת חבילה גבוהה יותר
                </h3>
                <p className="text-sm text-muted-foreground">
                    כדי לגשת לתכונה זו, יש לשדרג לחבילת{" "}
                    <span className="font-semibold text-foreground">{tierLabel}</span>.
                    <br/>
                    נא ליצור קשר עם הצוות לשדרוג המנוי.
                </p>
            </div>

            {/* Upgrade CTA */}
            <Link
                href="https://wa.me/972500000000?text=שלום, אשמח לשדרג את המנוי שלי במערכת FOZ AI."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
                <ArrowUpCircle className="h-4 w-4" />
                צור קשר לשדרוג המנוי
            </Link>
        </div>
    );
}

// ─── FeatureGate Component ────────────────────────────────────────────────────

export default function FeatureGate({
    currentTier,
    requiredFeature,
    children,
    fallback,
    silent = false,
}: FeatureGateProps) {
    const hasAccess = hasFeatureAccess(currentTier, requiredFeature);

    if (hasAccess) {
        return <>{children}</>;
    }

    // Access denied
    if (silent) {
        return null;
    }

    if (fallback !== undefined) {
        return <>{fallback}</>;
    }

    return <UpgradeCard requiredFeature={requiredFeature} />;
}