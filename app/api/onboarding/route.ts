import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { businessName, ownerName, phone, tone } = body;

        // 1. חיבור למסד הנתונים
        await connectDB();

        // 2. יצירת מזהה ייחודי (Slug) מהשם של העסק
        // למשל: "קליניקה שרה" יהפוך ל-"clinic-sara-123"
        const slug =
            businessName.toLowerCase().replace(/ /g, "-") +
            "-" +
            Math.floor(Math.random() * 1000);

        // 3. יצירת הלקוחה החדשה עם הצוות הדיגיטלי (ברירת מחדל)
        const newClient = await Client.create({
            slug,
            businessName,
            ownerName,
            phone,
            domainGuidelines: `קליניקה בבעלות ${ownerName}. סגנון דיבור: ${tone}.`,
            personas: {
                receptionist: {
                    name: "דניאלה",
                    role: "מנהלת קבלה",
                    prompt: "את דניאלה, מנהלת קבלה אדיבה ויעילה. תפקידך לקבוע תורים ולענות על שאלות בסיסיות.",
                    isActive: true,
                },
                marketing: {
                    name: "מיכל",
                    role: "מנהלת שיווק",
                    prompt: "את מיכל, מומחית שיווק יצירתית. תפקידך לכתוב פוסטים לאינסטגרם ולנסח הודעות מבצע.",
                    isActive: true,
                },
                analyst: {
                    name: "רועי",
                    role: "אנליסט עסקי",
                    prompt: "אתה רועי, רואה חשבון ואנליסט חד. תפקידך לנתח נתונים ולתת המלצות לשיפור הרווחיות.",
                    isActive: true,
                },
            },
        });

        return NextResponse.json({
            success: true,
            clientId: newClient._id,
            slug: newClient.slug,
        });
    } catch (error: any) {
        console.error("Onboarding Error:", error);
        return NextResponse.json(
            { error: "Failed to create account" },
            { status: 500 }
        );
    }
}
