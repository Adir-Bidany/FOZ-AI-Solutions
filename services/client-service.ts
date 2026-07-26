import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
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
    logo_url?: string;
}

// פונקציה 1: יצירת לקוח חדש
export async function createClient(data: CreateClientParams) {
    console.log("🟡 Starting client creation... Connecting to DB...");
    await connectDB();
    console.log("🟢 DB connected successfully!");

    // בדיקה אם המייל כבר קיים
    const existingUser = await Business.findOne({ ownerEmail: data.email });
    if (existingUser) {
        throw new Error("המייל הזה כבר רשום במערכת");
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // יצירת מזהה ייחודי (Slug)
    const slug = Math.random().toString(36).substring(2, 9);

    // יצירת הלקוח ב-DB
    console.log(`🟡 Creating Business document for ${data.email}...`);
    const newBusiness = await Business.create({
        slug,
        businessName: data.businessName,
        ownerName: data.ownerName,
        phone: data.phone,
        ownerEmail: data.email,
        password: hashedPassword,
        logo: data.logo_url,
        ai_settings: {
            tone: data.tone,
            language: "he",
            onboarding_status: "new"
        },
        operational_settings: {
            services: [], // Default empty
            opening_hours: {}
        },
        subscriptionStatus: "trial"
    });

    // המרה לאובייקט רגיל כדי למנוע בעיות עם Next.js
    console.log(`🟢 Business created successfully! ID: ${newBusiness._id}`);
    return JSON.parse(JSON.stringify(newBusiness));
}

// פונקציה 2: שליפת לקוח לפי מזהה (עבור האתר שלו)
export async function getClientBySlug(slug: string) {
    await connectDB();
    const business = await Business.findOne({ slug }).lean();

    // אם לא נמצא - מחזירים null
    if (!business) return null;

    // המרה לאובייקט רגיל
    return JSON.parse(JSON.stringify(business));
}
