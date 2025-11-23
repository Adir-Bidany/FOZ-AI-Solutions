import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ reply: "שגיאה: חסר מפתח API." });
        }

        const body = await req.json();
        const { messages, businessConfig } = body;

        const genAI = new GoogleGenerativeAI(apiKey);

        // ✅ התיקון: שימוש במודל שקיים ברשימה שלך בוודאות
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // הכנת היסטוריית השיחה
        const lastUserMessage = messages[messages.length - 1];
        const previousMessages = messages.slice(0, -1);

        let history = previousMessages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        // הסרת הודעת בוט אם היא הראשונה (דרישה טכנית של גוגל)
        if (history.length > 0 && history[0].role === "model") {
            history = history.slice(1);
        }

        const systemPrompt = `
      הנחיות מערכת:
      את/ה העוזר/ת האישי/ת של העסק "${businessConfig.businessName}".
      בעל העסק: ${businessConfig.ownerName}.
      סגנון דיבור: ${businessConfig.tone}.
      מידע עסקי: ${businessConfig.domainGuidelines}
      הנחיות: ענה בעברית בלבד. היה קצר, אדיב ושיווקי.
    `;

        // התחלת הצ'אט
        const chat = model.startChat({
            history: history,
        });

        console.log("📨 Sending request to Gemini 2.0 Flash...");

        // שליחת ההודעה
        const result = await chat.sendMessage(
            `${systemPrompt}\n\nשאלה מהלקוח: ${lastUserMessage.content}`
        );
        const response = await result.response;
        const reply = response.text();

        console.log("✅ Success!");
        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("❌ Google SDK Error:", error.message);
        return NextResponse.json({ reply: "סליחה, נתקלתי בבעיה טכנית רגעית." });
    }
}
