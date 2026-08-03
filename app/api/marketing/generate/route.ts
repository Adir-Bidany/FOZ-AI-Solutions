import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import AgentInsight from "@/models/AgentInsight";
import { createGeminiInstance, extractJsonFromText } from "@/lib/utils/ai-helpers";
import { v2 as cloudinary } from "cloudinary";

// ─── Cloudinary Configuration ──────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Uploads an image (URL or base64) to Cloudinary and returns the permanent secure_url.
 */
async function uploadToCloudinary(
    imageSource: string,
    folder: string = "foz-marketing"
): Promise<string> {
    const result = await cloudinary.uploader.upload(imageSource, {
        folder,
        resource_type: "image",
        quality: "auto:best",
        fetch_format: "auto",
    });
    return result.secure_url;
}

/**
 * Generates an AI image based on an English visual prompt,
 * uploads it to Cloudinary, and returns the Cloudinary secure_url.
 */
async function generateAndUploadImage(englishPrompt: string): Promise<string> {
    const cleanPrompt = encodeURIComponent(
        `${englishPrompt}, professional photography, high quality, 4k, minimal aesthetic`
    );

    // Primary AI image generation endpoint (Pollinations AI)
    const primaryUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1080&height=1080&nologo=true`;
    
    // High-quality fallback stock image for aesthetic clinics / businesses
    const fallbackUrl = `https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1080&q=80`;

    try {
        console.log("[Marketing Generation] Uploading AI generated image to Cloudinary...");
        return await uploadToCloudinary(primaryUrl);
    } catch (err: any) {
        console.warn("[Marketing Generation] Primary image upload failed, trying fallback:", err?.message || err);
        return await uploadToCloudinary(fallbackUrl);
    }
}

// ─── GET: Quota Status (No limit) ──────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        return NextResponse.json({
            canGenerateImage: true,
            lastImageGeneratedAt: null,
        });
    } catch (error: any) {
        console.error("[Marketing API GET Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ─── POST: Generate Post Text + Image ──────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { prompt = "", includeImage = false } = body;

        await connectToDatabase();
        const business = await Business.findOne({ ownerEmail: session.user.email });
        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        // ── 1. Generate Post Content via Gemini ────────────────────────────
        const systemInstruction = `You are Golda, a digital marketing expert for the business "${business.businessName}".
Create a compelling, professional Hebrew social media marketing post.

You MUST return ONLY a valid JSON object in this exact structure — no prose, no markdown fences:
{
  "title": "Short, catchy post title in Hebrew",
  "content": "Full post content in Hebrew with emojis, call-to-action, and hashtags",
  "imageVisualPrompt": "A concise image description IN ENGLISH ONLY for an AI image generator. Must be English. Example: 'Elegant spa treatment room with soft lighting, white towels, and rose petals on a wooden table, professional photography, warm tones'"
}

CRITICAL RULE: The value of "imageVisualPrompt" field must ALWAYS be written in English, regardless of what language the user wrote in.`;

        const model = createGeminiInstance({
            systemInstruction,
            modelName: "gemini-2.5-flash",
        });

        const userPrompt = prompt.trim()
            ? `Create a marketing post about: ${prompt}`
            : `Create a compelling marketing post for the business ${business.businessName}`;

        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text();

        const parsed = extractJsonFromText(responseText);

        if (!parsed) {
            console.warn("[Marketing Generation] JSON extraction failed. Raw Gemini response:", responseText.substring(0, 500));
        }

        const postData = parsed || {
            title: `פוסט שיווקי עבור ${business.businessName}`,
            content: responseText,
            imageVisualPrompt: `Luxury modern professional business aesthetic for ${business.businessName}, clean minimalist design, premium photography`,
        };

        // Enforce English prompt guard
        const isLikelyHebrew = (str: string) => /[\u0590-\u05FF]/.test(str);
        if (isLikelyHebrew(postData.imageVisualPrompt || "")) {
            console.warn("[Marketing Generation] imageVisualPrompt was returned in Hebrew — using safe English fallback.");
            postData.imageVisualPrompt = `Professional modern business marketing image for ${business.businessName}, elegant design, high quality photography`;
        }

        // ── 2. Generate Image & Upload to Cloudinary ───────────────────────
        let generatedImageUrl: string | undefined = undefined;

        if (includeImage) {
            try {
                generatedImageUrl = await generateAndUploadImage(postData.imageVisualPrompt);
                console.log("[Marketing Generation] Successfully stored Cloudinary URL:", generatedImageUrl);
            } catch (imgError: any) {
                console.error("[Marketing Generation] Image upload failed:", imgError?.message || imgError);
                generatedImageUrl = undefined;
            }
        }

        // ── 3. Save Post to DB ─────────────────────────────────────────────
        const newInsight = await AgentInsight.create({
            businessId: business._id,
            agentName: "Golda",
            type: "social_post",
            title: postData.title,
            content: postData.content,
            imageUrl: generatedImageUrl,
            status: "approved",
        });

        return NextResponse.json({
            success: true,
            insight: JSON.parse(JSON.stringify(newInsight)),
            canGenerateImage: true,
            imageGenerated: !!generatedImageUrl,
        });

    } catch (error: any) {
        console.error("[Marketing API POST Error]:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate marketing post" },
            { status: 500 }
        );
    }
}
