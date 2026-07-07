import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/services/client-service"; // שימוש בשירות החדש

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // אנחנו שולחים את כל המידע לפונקציה החכמה ב-Service
        // היא כבר תדאג להצפנה, לבדיקת כפילויות ולשמירה ב-DB
        const newClient = await createClient({
            businessName: body.businessName,
            ownerName: body.ownerName,
            phone: body.phone,
            email: body.email,
            password: body.password,
            tone: body.tone,
            niche: body.niche,
        });

        // Force clear the Vercel Edge Cache so the dashboard shows the new data instantly
        revalidatePath("/dashboard", "layout");
        revalidatePath(`/c/${newClient.slug}`, "page");

        return NextResponse.json({
            success: true,
            clientId: newClient._id,
            slug: newClient.slug,
        });
    } catch (error: any) {
        console.error("Onboarding Error:", error.message);

        // החזרת שגיאה מסודרת לצד לקוח (למשל "מייל תפוס")
        return NextResponse.json(
            { error: error.message || "Failed to create account" },
            { status: 400 }
        );
    }
}
