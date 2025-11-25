import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        await connectDB();

        // חיפוש הלקוחה לפי מייל וסיסמה
        // (הערה: במוצר סופי נצטרך להצפין סיסמאות, כרגע זה השוואה רגילה)
        const client = await Client.findOne({ email, password });

        if (!client) {
            return NextResponse.json(
                { success: false, error: "המייל או הסיסמה שגויים" },
                { status: 401 }
            );
        }

        // אם נמצאה - מחזירים את ה-Slug שלה כדי שהדפדפן ידע לאן ללכת
        return NextResponse.json({ success: true, slug: client.slug });
    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { success: false, error: "תקלה בשרת" },
            { status: 500 }
        );
    }
}
