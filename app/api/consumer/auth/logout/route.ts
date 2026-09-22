import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ success: true });
    
    // Clear the consumer token cookie
    response.cookies.set("consumer_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0 // Expire immediately
    });

    return response;
}
