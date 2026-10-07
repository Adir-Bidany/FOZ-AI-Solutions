import { getToken } from "next-auth/jwt";

/**
 * Verifies that an incoming API request carries a valid, signed NextAuth JWT
 * whose `role` claim is "admin". This is the ONLY accepted proof of admin
 * access for API routes — no client-settable cookie or header can grant it.
 *
 * Fails closed: if NEXTAUTH_SECRET is missing, nobody is an admin.
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return false;

    const token = await getToken({ req: req as any, secret });
    return token?.role === "admin";
}
