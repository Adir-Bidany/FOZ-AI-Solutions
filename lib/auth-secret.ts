/**
 * Single source of truth for the signing secret used by NextAuth and the
 * consumer JWT cookie. There is intentionally NO fallback value: if the
 * environment variable is missing we fail closed instead of signing/verifying
 * tokens with a publicly-known string.
 *
 * Evaluated lazily (at call time) so `next build` does not crash while
 * collecting page data when env vars are not present in the build step.
 */
export function getAuthSecret(): string {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error(
            "NEXTAUTH_SECRET is not configured. Refusing to sign or verify tokens without a secret."
        );
    }
    return secret;
}
