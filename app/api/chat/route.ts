import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: Request) {
    try {
        const { messages, businessConfig } = await req.json();

        // בניית הפרומפט (ההוראות לבוט) על בסיס הגדרות העסק
        const systemPrompt = `
      את/ה העוזר/ת האישי/ת של העסק "${businessConfig.businessName}".
      בעל העסק: ${businessConfig.ownerName}.
      סגנון דיבור: ${businessConfig.tone}.
      
      מידע על העסק:
      ${businessConfig.domainGuidelines}
      
      הנחיות:
      - ענה בעברית בלבד.
      - היה אדיב, קצר ותכליתי.
      - מטרתך היא לעזור ללקוח לקבל מידע או לקבוע תור.
    `;

        // הכנת הגוף לבקשה של גוגל
        const requestBody = {
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] }, // System instruction trick
                ...messages.map((m: any) => ({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{ text: m.content }],
                })),
            ],
        };

        // שליחה לגוגל
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "סליחה, לא הבנתי.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch response" },
            { status: 500 }
        );
    }
}
