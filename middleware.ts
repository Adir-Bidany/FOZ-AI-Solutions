import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // 1. הגנה על נתיבי דשבורד
    // אם מנסים להיכנס ל-/dashboard והמשתמש לא מחובר -> להעיף ללוגין
    if (pathname.startsWith("/dashboard")) {
        if (!token) {
            const url = new URL("/login", req.url);
            return NextResponse.redirect(url);
        }
    }

    // 2. Server-Side RBAC Admin Gate
    if (pathname.startsWith("/admin")) {
        const adminAccessCookie = req.cookies.get("admin_access")?.value;
        if (!adminAccessCookie && (!token || token.role !== "admin")) {
            const url = new URL("/", req.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

// הגדרת הנתיבים שעליהם השומר מגן
export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};
