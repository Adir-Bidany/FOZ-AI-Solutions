import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import AgentInsight from "@/models/AgentInsight";
import { createGeminiInstance, extractJsonFromText } from "@/lib/utils/ai-helpers";

function isSameCalendarDay(date1?: Date | null, date2?: Date): boolean {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const business = await Business.findOne({ ownerEmail: session.user.email }).lean();
        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        const isQuotaUsed = isSameCalendarDay(business.lastImageGeneratedAt, new Date());
        return NextResponse.json({
            canGenerateImage: !isQuotaUsed,
            lastImageGeneratedAt: business.lastImageGeneratedAt || null,
        });
    } catch (error: any) {
        console.error("[Marketing API GET Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

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

        const now = new Date();
        const quotaUsedToday = isSameCalendarDay(business.lastImageGeneratedAt, now);

        // 1. Quota Enforcement for Image Generation
        if (includeImage && quotaUsedToday) {
            return NextResponse.json(
                {
                    error: "DAILY_IMAGE_QUOTA_REACHED",
                    message: "נוצלה מכסת התמונות היומית (תמונה 1 ביום בלבד). ניתן לנסות שוב מחר.",
                },
                { status: 429 }
            );
        }

        // 2. Generate Marketing Post Text using Gemini AI
        const systemInstruction = `אתה גולדה (Golda), מומחית השיווק הדיגיטלי והתוכן של FOZ AI Solutions עבור העסק "${business.businessName}". 
צור פוסט שיווקי מושך, מקצועי ואיכותי בעברית לרשתות החברתיות.
החזר תמיד תשובת JSON קבילה במבנה המדויק הבא בלבד:
{
  "title": "כותרת קצרה ומושכת לפוסט",
  "content": "תוכן הפוסט המלא עם אימוג׳ים מתאימים, קריאה לפעולה והאשטאגים",
  "imageVisualPrompt": "תיאור באנגלית קצרה וממוקדת עבור מחולל תמונות AI שמציג את הקונספט הויזואלי של הפוסט"
}`;

        const model = createGeminiInstance({
            systemInstruction,
            modelName: "gemini-2.5-flash",
        });

        const userPrompt = prompt.trim()
            ? `צור פוסט שיווקי בנושא: ${prompt}`
            : `צור פוסט שיווקי מוביל ומזמין עבור העסק ${business.businessName}`;

        const result = await model.generateContent(userPrompt);
        const responseText = result.response.text();
        const parsed = extractJsonFromText(responseText) || {
            title: `פוסט שיווקי עבור ${business.businessName}`,
            content: responseText,
            imageVisualPrompt: `Luxury modern aesthetic post for ${business.businessName}`,
        };

        let generatedImageUrl: string | undefined = undefined;

        // 3. If Image Requested & Quota Allowed: Generate AI Image
        if (includeImage) {
            const visualPrompt = parsed.imageVisualPrompt || `Professional high-end photo for ${business.businessName}`;
            const cleanPrompt = encodeURIComponent(
                `${visualPrompt}, minimal aesthetic, highly detailed, 8k resolution, professional photography, studio lighting`
            );
            
            // Generate AI Image via Pollinations Imagen generator
            generatedImageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1080&height=1080&nologo=true&seed=${Date.now()}`;

            // Update business daily quota timestamp
            business.lastImageGeneratedAt = now;
            await business.save();
        }

        // 4. Save Marketing Insight to Database
        const newInsight = await AgentInsight.create({
            businessId: business._id,
            agentName: "Golda",
            type: "social_post",
            title: parsed.title,
            content: parsed.content,
            imageUrl: generatedImageUrl,
            status: "approved",
        });

        return NextResponse.json({
            success: true,
            insight: JSON.parse(JSON.stringify(newInsight)),
            canGenerateImage: !includeImage ? !quotaUsedToday : false,
        });
    } catch (error: any) {
        console.error("[Marketing API POST Error]:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate marketing post" },
            { status: 500 }
        );
    }
}
