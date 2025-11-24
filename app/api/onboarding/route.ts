import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // הוספתי את email ו-password לרשימת השדות שאנחנו מקבלים
        const { businessName, ownerName, phone, email, password, tone, niche } =
            body;

        await connectDB();

        // בדיקה אם המייל כבר קיים במערכת (למניעת כפילויות)
        const existingUser = await Client.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "המייל הזה כבר רשום במערכת" },
                { status: 400 }
            );
        }

        // יצירת מזהה אקראי באנגלית (למשל: a7x92b)
        const slug = Math.random().toString(36).substring(2, 9);

        const newClient = await Client.create({
            slug,
            businessName,
            ownerName,
            phone,
            email, // <--- נשמר ב-DB
            password, // <--- נשמר ב-DB (הערה: בפרודקשן נצפין את זה)
            niche,
            domainGuidelines: `קליניקה בבעלות ${ownerName}. סגנון דיבור: ${tone}. תחום עיסוק: ${niche}.`,
            personas: {
                receptionist: {
                    name: "דניאלה",
                    role: "קבלה",
                    prompt: "...",
                    isActive: true,
                },
                marketing: {
                    name: "מיכל",
                    role: "שיווק",
                    prompt: "...",
                    isActive: true,
                },
                analyst: {
                    name: "רועי",
                    role: "אנליסט",
                    prompt: "...",
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
