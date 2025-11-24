import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            return NextResponse.json({ reply: "Error: API Key missing" });

        const { slug, messages } = await req.json();
        await connectDB();
        const client = await Client.findOne({ slug });
        if (!client) return NextResponse.json({ reply: "שגיאה: לא נמצא עסק." });

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const nicheMap: Record<string, string> = {
            aesthetics: "קליניקת אסתטיקה",
            therapy: "קליניקה לטיפול וייעוץ",
            hair: "מספרה / ברברשופ",
            alternative: "קליניקה לרפואה משלימה",
        };
        const businessType = client.niche
            ? nicheMap[client.niche] || "עסק שירותי"
            : "עסק שירותי";

        // בדיקה אם זו ההודעה הראשונה
        const isFirstMessage = messages.length === 0;

        const systemPrompt = `
      תפקיד: יועץ עסקי שמקים בוט ל"${
          client.businessName
      }" (${businessType}) של ${client.ownerName}.
      
      הנחיות קריטיות לשיחה:
      1. המטרה: להשיג 3 פרטים (שירותים ומחירים, שעות פתיחה, בידול/חוקים).
      2. שאל שאלה אחת בכל פעם.
      3. ${
          isFirstMessage
              ? "התחל בברכה קצרה ונעימה ואז שאל את השאלה הראשונה."
              : "אל תחזור על הברכה! תגיב עניינית לתשובת הלקוח ושאל מיד את השאלה הבאה בתור."
      }
      4. אם סיימתם את כל 3 הנושאים, כתוב רק: "סיימנו_הגדרה".
    `;

        let history = messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        // הסרת הודעת המערכת הראשונית מההיסטוריה אם קיימת
        if (history.length > 0 && history[0].role === "model")
            history = history.slice(1);

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(
            systemPrompt +
                (isFirstMessage
                    ? ""
                    : "\n\n(המשך את הראיון באופן טבעי, בלי ברכות פתיחה חוזרות)")
        );
        const response = await result.response;
        const reply = response.text();
        const isFinished = reply.includes("סיימנו_הגדרה");

        // שמירה
        if (messages.length > 0) {
            const lastUserAnswer = messages[messages.length - 1].content;
            client.domainGuidelines =
                (client.domainGuidelines || "") + `\n${lastUserAnswer}`;
            await client.save();
        }

        return NextResponse.json({ reply, isFinished });
    } catch (error: any) {
        console.error("Setup Chat Error:", error);
        return NextResponse.json({ reply: "יש לי תקלה רגעית." });
    }
}
