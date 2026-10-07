import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/services/client-service";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";

export async function POST(req: Request) {
    let body: any;
    try {
        body = await req.json();

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
            logo_url: body.logo_url,
        });

        // Force clear the Vercel Edge Cache so the dashboard shows the new data instantly
        revalidatePath("/dashboard", "layout");
        revalidatePath(`/${newClient.slug}`, "page");

        return NextResponse.json({
            success: true,
            clientId: newClient._id,
            slug: newClient.slug,
        });
    } catch (error: any) {
        console.error("🔴 ONBOARDING API ERROR:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        // החזרת שגיאה מסודרת לצד לקוח (למשל "מייל תפוס")
        return NextResponse.json(
            { error: errorMessage || "Failed to create account" },
            { status: 400 }
        );
    }
}
