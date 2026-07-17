import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { error: "No image provided" },
                { status: 400 }
            );
        }

        // In a production environment, you would upload this base64 string 
        // to AWS S3, Vercel Blob, Cloudinary, etc., and return the CDN URL.
        // For local development, we pass the base64 string back to act as the URL.
        const logoUrl = image;

        return NextResponse.json({ success: true, url: logoUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json(
            { error: "Failed to process logo" },
            { status: 500 }
        );
    }
}
