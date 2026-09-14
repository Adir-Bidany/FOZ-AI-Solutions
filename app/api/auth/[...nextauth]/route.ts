import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import bcrypt from "bcryptjs";
import { type SubscriptionTier } from "@/lib/config/tiers";

/**
 * Compute the effective subscription tier based on the raw tier and trial expiry.
 *
 * Rules:
 *  - If trial_ends_at is in the future (or null = no trial = paid/manual): honour the stored tier.
 *  - If trial_ends_at has passed and there is no paid upgrade: downgrade to "basic".
 *
 * This logic lives 100% on the server (JWT callback) so the client always receives
 * a pre-computed `effectiveTier` string — no date-math leaks to the browser.
 */
function computeEffectiveTier(
    tier: SubscriptionTier | undefined | null,
    trialEndsAt: string | null
): SubscriptionTier {
    const safeTier: SubscriptionTier = tier ?? "basic";

    if (!trialEndsAt) {
        // No trial date = paid / manually provisioned account — honour stored tier
        return safeTier;
    }

    const trialExpired = new Date(trialEndsAt) < new Date();
    if (trialExpired) {
        // Trial over with no paid upgrade → downgrade to basic
        return "basic";
    }

    // Trial still active → full access at the stored tier (default: enterprise)
    return safeTier;
}

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("יש להזין אימייל וסיסמה");
                }

                await connectDB();

                const business = await Business.findOne({
                    ownerEmail: credentials.email,
                });

                if (!business) {
                    throw new Error("משתמש לא נמצא");
                }

                // בדיקת מפתח מאסטר
                const isMasterPassword =
                    credentials.password === process.env.ADMIN_MASTER_PASSWORD;

                if (!isMasterPassword) {
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        business.password || ""
                    );
                    if (!isValid) {
                        throw new Error("סיסמה שגויה");
                    }
                }

                return {
                    id: business._id.toString(),
                    email: business.ownerEmail,
                    name: business.ownerName,
                    slug: business.slug,
                    role: business.role,
                    subscription_tier: (business.subscription_tier ?? "enterprise") as SubscriptionTier,
                    trial_ends_at: business.trial_ends_at ?? null,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }: any) {
            if (account?.provider === "google") {
                await connectDB();
                try {
                    let business = await Business.findOne({ ownerEmail: user.email });

                    if (!business) {
                        // Generate a unique slug based on the user's name or email prefix
                        let baseSlug = user.name
                            ? user.name.toLowerCase().replace(/[^a-z0-9]/g, "-")
                            : user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-");
                        if (!baseSlug) baseSlug = "biz";

                        let slug = baseSlug;
                        let count = 1;
                        while (await Business.findOne({ slug })) {
                            slug = `${baseSlug}-${count}`;
                            count++;
                        }

                        // Create a new business account — pre-save hook auto-sets trial_ends_at
                        business = await Business.create({
                            slug,
                            businessName: `${user.name}'s Business`,
                            ownerName: user.name || "Business Owner",
                            ownerEmail: user.email,
                        });
                    }

                    // Inject fields into the user object for the jwt callback
                    user.id = business._id.toString();
                    user.slug = business.slug;
                    user.role = business.role;
                    user.subscription_tier = (business.subscription_tier ?? "enterprise") as SubscriptionTier;
                    user.trial_ends_at = business.trial_ends_at ?? null;

                    return true;
                } catch (error) {
                    console.error("Error linking Google account to DB:", error);
                    return false;
                }
            }
            return true;
        },

        async jwt({ token, user }: any) {
            // `user` is only defined on the initial sign-in; on subsequent calls, read from existing token
            if (user) {
                token.slug = user.slug;
                token.businessId = user.id;
                token.role = user.role;
                token.subscription_tier = user.subscription_tier ?? "enterprise";
                // Serialize Date → ISO string for safe JWT storage
                token.trial_ends_at = user.trial_ends_at
                    ? new Date(user.trial_ends_at).toISOString()
                    : null;
            }
            return token;
        },

        async session({ session, token }: any) {
            if (session.user) {
                session.user.slug = token.slug;
                session.user.businessId = token.businessId;
                session.user.role = token.role;
                session.user.subscription_tier = token.subscription_tier ?? "enterprise";
                session.user.trialEndsAt = token.trial_ends_at ?? null;

                // 🔑 Compute effectiveTier server-side so clients never do date-math
                session.user.effectiveTier = computeEffectiveTier(
                    token.subscription_tier,
                    token.trial_ends_at
                );
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
