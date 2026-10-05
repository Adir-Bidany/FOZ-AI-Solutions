import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
    // Run middleware on all requests except API routes, static files, and images
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    
    // 1. Subdomain Extraction
    const hostname = req.headers.get("host") || "";
    
    // Determine the root domain based on environment (localhost or prod)
    // E.g., foz.co.il or localhost:3000
    const currentHost = process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
        ? hostname.replace(`.foz.co.il`, "") // Vercel specific domain
        : hostname.replace(`.localhost:3000`, ""); // Local testing

    // Check if it's a subdomain (e.g. "my-business") vs root ("localhost:3000" or "www")
    const isSubdomain = currentHost !== hostname && currentHost !== "www" && currentHost !== "app" && currentHost !== "admin";

    // If it's a valid tenant subdomain, quietly rewrite the request to our /site/[subdomain] folder
    if (isSubdomain) {
        // Rewrite to app/site/[subdomain]/...
        return NextResponse.rewrite(new URL(`/site/${currentHost}${pathname === "/" ? "" : pathname}`, req.url));
    }

    // 2. Main App Authentication (Dashboard & Admin)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (pathname.startsWith("/dashboard")) {
        if (!token) {
            const url = new URL("/login", req.url);
            return NextResponse.redirect(url);
        }
    }

    if (pathname.startsWith("/admin")) {
        if (!token || token.role !== "admin") {
            const url = new URL("/", req.url);
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}
