import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { type SubscriptionTier } from "@/lib/config/tiers"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context.
     */
    interface Session {
        user: {
            /** The business's unique ID (MongoDB _id) */
            businessId: string
            /** The business's slug */
            slug: string
            /** The user's admin/user role */
            role: string
            /** The raw subscription tier stored in the DB (basic | pro | enterprise) */
            subscription_tier: SubscriptionTier
            /**
             * The CALCULATED effective tier after applying trial expiry logic.
             * - During active trial: equals subscription_tier (enterprise).
             * - After trial expires with no paid upgrade: "basic".
             * This is what FeatureGate should consume — never do date-math on the client.
             */
            effectiveTier: SubscriptionTier
            /** ISO string of when the 14-day trial ends (null if no trial / manual account) */
            trialEndsAt: string | null
        } & DefaultSession["user"]
    }

    interface User {
        slug: string
        role: string
        subscription_tier: SubscriptionTier
        trial_ends_at: Date | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        businessId: string
        slug: string
        role: string
        subscription_tier: SubscriptionTier
        trial_ends_at: string | null
    }
}
