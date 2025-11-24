import mongoose, { Schema, model, models } from "mongoose";

// הגדרת המבנה של "עובד דיגיטלי" (למשל דניאלה או מיכל)
const PersonaSchema = new Schema({
    name: { type: String, required: true }, // שם העובד (דניאלה/מיכל)
    role: { type: String, required: true }, // תפקיד (קבלה/שיווק)
    prompt: { type: String, required: true }, // ההוראות למוח של ה-AI
    isActive: { type: Boolean, default: true },
});

// הגדרת המבנה של הלקוחה (הקליניקה)
const ClientSchema = new Schema({
    slug: { type: String, required: true, unique: true }, // המזהה הייחודי (למשל: sarah-clinic)
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    phone: { type: String },
    email: { type: String, required: true, unique: true }, // הוספתי
    password: { type: String, required: true }, // הוספתי (בפועל צריך להצפין, לדמו זה בסדר כטקסט)
    niche: { type: String, required: true, default: "aesthetics" },

    // כאן יושב הצוות הדיגיטלי!
    personas: {
        receptionist: PersonaSchema, // דניאלה
        marketing: PersonaSchema, // מיכל
        analyst: PersonaSchema, // רועי
    },

    // הגדרות כלליות
    domainGuidelines: { type: String }, // מידע על הטיפולים והמחירים
    createdAt: { type: Date, default: Date.now },
});

// יצירת המודל (או שימוש בקיים אם כבר נוצר)
const Client = models.Client || model("Client", ClientSchema);

export default Client;
