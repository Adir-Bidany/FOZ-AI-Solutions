import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import bcrypt from "bcryptjs"; // <--- חדש

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { businessName, ownerName, phone, email, password, tone, niche } =
            body;

        await connectDB();

        // בדיקת כפילות
        const existingUser = await Client.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "המייל הזה כבר רשום במערכת" },
                { status: 400 }
            );
        }

        // --- הצפנת הסיסמה (החלק החדש והחשוב!) ---
        // המערכת הופכת את "123456" למחרוזת ארוכה ובלתי קריאה
        const hashedPassword = await bcrypt.hash(password, 10);

        // יצירת slug
        const slug = Math.random().toString(36).substring(2, 9);

        const newClient = await Client.create({
            slug,
            businessName,
            ownerName,
            phone,
            email,
            password: hashedPassword, // <--- שומרים את המוצפן, לא את המקורי!
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
