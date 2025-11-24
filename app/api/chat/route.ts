import { NextResponse } from "next/server";
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";
import { getAvailableSlots } from "@/lib/simplybook";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            return NextResponse.json({ reply: "שגיאה: חסר מפתח API." });

        const body = await req.json();
        const { messages, businessConfig } = body;

        const genAI = new GoogleGenerativeAI(apiKey);

        // 1. הגדרת הכלים
        const tools = [
            {
                functionDeclarations: [
                    {
                        name: "check_availability",
                        description:
                            "בודק מתי יש תורים פנויים ביומן למחר. השתמש בזה כשלקוח שואל 'מתי פנוי' או 'אפשר לקבוע תור'.",
                    },
                ],
            },
        ];

        // 2. הגדרות בטיחות (התיקון החשוב!)
        // אנחנו אומרים לו לא לחסום שיחות על כסף או עסקים
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            },
        ];

        // 3. אתחול המודל עם ההגדרות החדשות
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            tools: tools,
            safetySettings: safetySettings,
        });

        // סידור ההיסטוריה
        const lastUserMessage = messages[messages.length - 1];
        const previousMessages = messages.slice(0, -1);
        let history = previousMessages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));
        if (history.length > 0 && history[0].role === "model")
            history = history.slice(1);

        const chat = model.startChat({ history });

        console.log("📨 Sending request to Gemini (Uncensored)...");

        const result = await chat.sendMessage(lastUserMessage.content);
        const response = await result.response;

        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            if (call.name === "check_availability") {
                const slotsData = await getAvailableSlots();
                const result2 = await chat.sendMessage([
                    {
                        functionResponse: {
                            name: "check_availability",
                            response: { output: slotsData },
                        },
                    },
                ]);
                return NextResponse.json({ reply: result2.response.text() });
            }
        }

        return NextResponse.json({ reply: response.text() });
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        // במקרה של חסימה קיצונית, נחזיר הודעה נעימה יותר
        if (
            error.message.includes("SAFETY") ||
            error.message.includes("blocked")
        ) {
            return NextResponse.json({
                reply: "אני מתנצל, לא הצלחתי לעבד את הבקשה הזו. בוא ננסה לנסח את זה אחרת.",
            });
        }
        return NextResponse.json({ reply: "סליחה, יש לי בעיה בתקשורת כרגע." });
    }
}
