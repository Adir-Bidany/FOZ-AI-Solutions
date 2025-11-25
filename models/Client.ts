import mongoose, { Schema, model, models } from "mongoose";

// הגדרת המבנה של "עובד דיגיטלי" (למשל דניאלה או מיכל)
const PersonaSchema = new Schema({
    name: { type: String, required: true }, // שם העובד
    role: { type: String, required: true }, // תפקיד (קבלה/שיווק)
    prompt: { type: String, required: true }, // ההוראות למוח של ה-AI
    isActive: { type: Boolean, default: true },
});

// הגדרת המבנה של הלקוחה (הקליניקה)
const ClientSchema = new Schema({
    // --- פרטים מזהים ---
    slug: { type: String, required: true, unique: true }, // המזהה בכתובת האתר
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    phone: { type: String },

    // --- פרטי התחברות ---
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // סיסמה מוצפנת

    // --- הגדרות עיצוב ותוכן ---
    niche: { type: String, required: true, default: "aesthetics" }, // סוג העסק
    logo: { type: String }, // <--- השדה החדש! (שומר את התמונה כטקסט ארוך Base64)

    // --- אינטגרציות (חיבור ליומן) ---
    integrations: {
        simplybook: {
            companyLogin: { type: String },
            apiKey: { type: String },
            isConnected: { type: Boolean, default: false },
        },
    },

    // --- מוח ה-AI ---
    domainGuidelines: { type: String }, // המידע שהבוט לומד בראיון

    // הצוות הדיגיטלי
    personas: {
        receptionist: PersonaSchema, // דניאלה
        marketing: PersonaSchema, // מיכל
        analyst: PersonaSchema, // רועי
    },

    createdAt: { type: Date, default: Date.now },
});

// יצירת המודל (או שימוש בקיים אם כבר נוצר בזיכרון)
const Client = models.Client || model("Client", ClientSchema);

export default Client;
