import connectDB from "@/lib/db";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";

// הגדרת סוג הנתונים שאנחנו מצפים לקבל בהרשמה
interface CreateClientParams {
    businessName: string;
    ownerName: string;
    phone: string;
    email: string;
    password: string;
    niche: string;
    tone: string;
}

// פונקציה 1: יצירת לקוח חדש
export async function createClient(data: CreateClientParams) {
    await connectDB();

    // בדיקה אם המייל כבר קיים
    const existingUser = await Client.findOne({ email: data.email });
    if (existingUser) {
        throw new Error("המייל הזה כבר רשום במערכת");
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // יצירת מזהה ייחודי (Slug)
    const slug = Math.random().toString(36).substring(2, 9);

    // יצירת הלקוח ב-DB
    const newClient = await Client.create({
        slug,
        businessName: data.businessName,
        ownerName: data.ownerName,
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
        niche: data.niche,
        domainGuidelines: `קליניקה בבעלות ${data.ownerName}. סגנון דיבור: ${data.tone}. תחום עיסוק: ${data.niche}.`,
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

    // המרה לאובייקט רגיל כדי למנוע בעיות עם Next.js
    return JSON.parse(JSON.stringify(newClient));
}

// פונקציה 2: שליפת לקוח לפי מזהה (עבור האתר שלו)
export async function getClientBySlug(slug: string) {
    await connectDB();
    const client = await Client.findOne({ slug }).lean();

    // אם לא נמצא - מחזירים null
    if (!client) return null;

    // המרה לאובייקט רגיל
    return JSON.parse(JSON.stringify(client));
}
