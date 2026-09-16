/**
 * lib/config/tiers.ts
 * Single source of truth for subscription tiers and feature flags.
 * To add a new feature: (1) add the string to FeatureFlag, (2) assign it to the correct tier(s) below.
 */

// ─── Tier Definition ─────────────────────────────────────────────────────────

export type SubscriptionTier = "basic" | "pro" | "enterprise";

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, { label: string; rank: number }> = {
    basic: { label: "Basic", rank: 1 },
    pro: { label: "Pro", rank: 2 },
    enterprise: { label: "Enterprise", rank: 3 },
};

// ─── Feature Flags ────────────────────────────────────────────────────────────

export type FeatureFlag =
    // Basic
    | "WEBSITE_EDITOR"         // /dashboard/website — edit landing page hero, upload logo
    | "CRM_BASIC"              // /dashboard/customers — view leads, approve, delete
    | "SHARED_INBOX"           // /dashboard/customers — SharedChatInboxUI
    | "DASHBOARD_METRICS"      // /dashboard — HeroMetrics KPI cards
    | "PROFILE_SETTINGS"       // /dashboard/settings — edit business name, address, etc.

    // Pro
    | "CALENDAR_SYNC"          // /dashboard/calendar — SimplyBook integration & weekly view
    | "WHATSAPP_ANCHOR"        // Sidebar/BrandingAnchor — WhatsApp integration toggle
    | "LIVE_CHAT_INTERVENTION" // /dashboard/customers — CustomerChatModal for direct messaging
    | "ACTION_CENTER"          // /dashboard — ActionCenter agent recommendations + edit/approve/dismiss
    | "MISSING_INFO_RESOLVER"  // /dashboard/growth — answer AI knowledge-gap questions

    // Enterprise
    | "MARKETING_HUB"          // /dashboard/marketing — MarketingContentHub
    | "AI_IMAGE_GENERATOR"     // /dashboard/marketing — generate images inside InsightCard
    | "SOCIAL_PUBLISHER"       // /dashboard/marketing — publish to Facebook / Instagram
    | "GOLDA_CHAT"             // Sidebar — "שיחה עם גולדה" chat modal
    | "PROMPT_EDITOR"          // /dashboard/growth — publicInstructions textarea
    | "CSV_EXPORT"             // /dashboard — AnalyticsSection CSV download
    | "AGENT_INSIGHTS_FEED"    // /dashboard — AgentInsightsFeed real-time log
    | "SYSTEM_AUDIT_LOG";      // /dashboard — SystemAuditLog

// ─── Tier Feature Map ─────────────────────────────────────────────────────────
// Each tier lists only the features that are NEWLY unlocked at that tier.
// Use hasFeatureAccess() (tierAccess.ts) to check cumulative access.

export const TIER_FEATURES: Record<SubscriptionTier, ReadonlySet<FeatureFlag>> = {
    basic: new Set<FeatureFlag>([
        "WEBSITE_EDITOR",
        "CRM_BASIC",
        "SHARED_INBOX",
        "DASHBOARD_METRICS",
        "PROFILE_SETTINGS",
    ]),

    pro: new Set<FeatureFlag>([
        // Inherits all BASIC features (resolved at runtime by hasFeatureAccess)
        "CALENDAR_SYNC",
        "WHATSAPP_ANCHOR",
        "LIVE_CHAT_INTERVENTION",
        "ACTION_CENTER",
        "MISSING_INFO_RESOLVER",
    ]),

    enterprise: new Set<FeatureFlag>([
        // Inherits all PRO + BASIC features
        "MARKETING_HUB",
        "AI_IMAGE_GENERATOR",
        "SOCIAL_PUBLISHER",
        "GOLDA_CHAT",
        "PROMPT_EDITOR",
        "CSV_EXPORT",
        "AGENT_INSIGHTS_FEED",
        "SYSTEM_AUDIT_LOG",
    ]),
};

/**
 * Ordered list of tiers from lowest to highest rank.
 * Used to resolve cumulative feature access (a higher tier includes all lower-tier features).
 */
export const TIER_RANK_ORDER: SubscriptionTier[] = ["basic", "pro", "enterprise"];