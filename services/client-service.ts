import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import bcrypt from "bcryptjs";
import { RESERVED_SLUGS } from "@/lib/constants/reserved-slugs";

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

/**
 * Transliterates Hebrew or cleans English business names into a URL-friendly slug.
 */
export function slugifyName(name: string): string {
    const hebrewMap: Record<string, string> = {
        'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h', 'ו': 'v', 'ז': 'z',
        'ח': 'ch', 'ט': 't', 'י': 'y', 'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm',
        'ם': 'm', 'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p', 'ף': 'p',
        'צ': 'tz', 'ץ': 'tz', 'ק': 'k', 'ר': 'r', 'ש': 'sh', 'ת': 't'
    };

    let normalized = (name || "")
        .toLowerCase()
        .split('')
        .map(char => hebrewMap[char] || char)
        .join('');

    let slug = normalized
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');

    if (!slug || slug.length < 2) {
        slug = "biz";
    }
    return slug;
}

/**
 * Generates a clean human-readable slug that is guaranteed NOT to collide
 * with reserved system routes or existing businesses in MongoDB.
 */
export async function generateUniqueSlug(businessName: string): Promise<string> {
    const baseSlug = slugifyName(businessName);
    let candidate = baseSlug;
    let counter = 1;

    while (
        RESERVED_SLUGS.has(candidate.toLowerCase()) ||
        await Business.findOne({ slug: candidate }).lean()
    ) {
        counter++;
        candidate = `${baseSlug}-${counter}`;
    }

    return candidate;
}

// פונקציה 1: יצירת לקוח חדש
export async function createClient(data: CreateClientParams) {
    console.log("🟡 Starting client creation... Connecting to DB...");
    await connectDB();
    console.log("🟢 DB connected successfully!");

    // בדיקה אם המייל כבר קיים
    const existingUser = await Business.findOne({ ownerEmail: data.email }).lean();
    if (existingUser) {
        throw new Error("המייל הזה כבר רשום במערכת");
    }

    // הצפנת הסיסמה
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // יצירת מזהה ייחודי נקי ובטוח (Slug)
    const slug = await generateUniqueSlug(data.businessName);

    // יצירת הלקוח ב-DB
    console.log(`🟡 Creating Business document for ${data.email} with slug '${slug}'...`);
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
            services: [],
            opening_hours: {}
        },
        subscriptionStatus: "trial"
    });

    console.log(`🟢 Business created successfully! ID: ${newBusiness._id}, Slug: ${slug}`);
    return JSON.parse(JSON.stringify(newBusiness));
}

// פונקציה 2: שליפת לקוח לפי מזהה (עבור האתר שלו)
export async function getClientBySlug(slug: string) {
    await connectDB();
    const business = await Business.findOne({ slug }).lean();

    if (!business) return null;

    return JSON.parse(JSON.stringify(business));
}
