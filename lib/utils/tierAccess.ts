/**
 * lib/utils/tierAccess.ts
 * Runtime utilities for checking feature access based on subscription tier.
 */

import {
    type SubscriptionTier,
    type FeatureFlag,
    TIER_FEATURES,
    TIER_RANK_ORDER,
} from "@/lib/config/tiers";

/**
 * Returns true if `tier` has access to `feature`.
 *
 * Access is CUMULATIVE: a higher tier includes all features from lower tiers.
 *   ENTERPRISE => has all PRO + BASIC features.
 *   PRO        => has all BASIC features.
 *   BASIC      => has only BASIC features.
 *
 * @example
 *   hasFeatureAccess("pro", "CALENDAR_SYNC")   // true
 *   hasFeatureAccess("basic", "GOLDA_CHAT")    // false
 *   hasFeatureAccess("enterprise", "CRM_BASIC") // true (inherited from basic)
 */
export function hasFeatureAccess(
    tier: SubscriptionTier,
    feature: FeatureFlag
): boolean {
    const tierIndex = TIER_RANK_ORDER.indexOf(tier);

    // Walk from BASIC up to the user's current tier and check each level's set
    for (let i = 0; i <= tierIndex; i++) {
        const levelTier = TIER_RANK_ORDER[i];
        if (TIER_FEATURES[levelTier].has(feature)) {
            return true;
        }
    }

    return false;
}

/**
 * Returns the minimum tier required to access a given feature.
 * Returns null if the feature is not defined in any tier (shouldn't happen in production).
 *
 * @example
 *   getRequiredTier("GOLDA_CHAT")    // "enterprise"
 *   getRequiredTier("CRM_BASIC")     // "basic"
 *   getRequiredTier("CALENDAR_SYNC") // "pro"
 */
export function getRequiredTier(feature: FeatureFlag): SubscriptionTier | null {
    for (const tier of TIER_RANK_ORDER) {
        if (TIER_FEATURES[tier].has(feature)) {
            return tier;
        }
    }
    return null;
}

/**
 * Returns a list of all features accessible by a given tier (cumulative).
 *
 * @example
 *   getAllAccessibleFeatures("pro")
 *   // => Set of all BASIC + PRO features
 */
export function getAllAccessibleFeatures(tier: SubscriptionTier): Set<FeatureFlag> {
    const tierIndex = TIER_RANK_ORDER.indexOf(tier);
    const accessible = new Set<FeatureFlag>();

    for (let i = 0; i <= tierIndex; i++) {
        const levelTier = TIER_RANK_ORDER[i];
        for (const feature of TIER_FEATURES[levelTier]) {
            accessible.add(feature);
        }
    }

    return accessible;
}