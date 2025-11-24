import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAvailableSlots, bookAppointment } from "@/lib/simplybook";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            return NextResponse.json({ reply: "שגיאה: חסר מפתח API." });

        const body = await req.json();
        const { messages, businessConfig, activePersona } = body;

        const genAI = new GoogleGenerativeAI(apiKey);

        // --- תיקון הגדרת הכלים (Tools) ---
        // במקום להשתמש ב-SchemaType שיכול לעשות בעיות, נגדיר את זה כאובייקט פשוט
        const isReceptionist =
            !activePersona || activePersona === "receptionist";

        // מגדירים את הכלים רק אם צריך (לדניאלה)
        const tools = isReceptionist
            ? [
                  {
                      functionDeclarations: [
                          {
                              name: "check_availability",
                              description:
                                  "בודק תורים פנויים. השתמש בזה כששואלים מתי פנוי.",
                          },
                          {
                              name: "book_appointment",
                              description:
                                  "קובע תור סופי ביומן. השתמש בזה רק אחרי שהלקוח נתן: תאריך, שעה, שם וטלפון.",
                              parameters: {
                                  type: "OBJECT", // שימוש במחרוזת פשוטה במקום SchemaType.OBJECT
                                  properties: {
                                      date: {
                                          type: "STRING",
                                          description:
                                              "תאריך בפורמט YYYY-MM-DD",
                                      },
                                      time: {
                                          type: "STRING",
                                          description: "שעה בפורמט HH:mm",
                                      },
                                      name: {
                                          type: "STRING",
                                          description: "שם הלקוח",
                                      },
                                      phone: {
                                          type: "STRING",
                                          description: "מספר טלפון",
                                      },
                                  },
                                  required: ["date", "time", "name", "phone"],
                              },
                          },
                      ],
                  },
              ]
            : undefined; // שימוש ב-undefined במקום מערך ריק לפעמים עדיף, או מערך ריק

        // אם לא דניאלה - נשלח בלי tools בכלל (נקי יותר)
        const modelParams: any = { model: "gemini-2.0-flash" };
        if (isReceptionist) {
            modelParams.tools = tools;
        }

        const model = genAI.getGenerativeModel(modelParams);

        // --- המשך הקוד (בניית הפרומפט) ---
        let personaPrompt = "";

        if (activePersona === "marketing") {
            personaPrompt = `
            את מיכל, מנהלת השיווק של "${businessConfig.businessName}".
            הסגנון שלך: אנרגטי, יצירתי, מומחית לאינסטגרם וטיקטוק.
            המטרה: לעזור לבעלת העסק ברעיונות לפוסטים ושיווק.
        `;
        } else if (activePersona === "analyst") {
            personaPrompt = `
            אתה רועי, האנליסט העסקי של "${businessConfig.businessName}".
            הסגנון שלך: קצר, ענייני, מבוסס נתונים.
            המטרה: לנתח מצבים ולהמליץ על שיפורים עסקיים.
        `;
        } else {
            personaPrompt = `
            את דניאלה, מנהלת הקבלה של "${businessConfig.businessName}".
            הסגנון שלך: שירותי, אדיב ומכירתי.
            המטרה: לנהל את היומן, לבדוק זמינות, ולסגור תורים.
            כשאת קובעת תור - תמיד תוודאי שיש לך את כל הפרטים (תאריך, שעה, שם, טלפון).
        `;
        }

        const systemPrompt = `
      ${personaPrompt}
      
      מידע על העסק:
      בעלים: ${businessConfig.ownerName}
      מידע כללי: ${businessConfig.domainGuidelines}
      
      הנחיות: ענה בעברית בלבד.
    `;

        // הכנת היסטוריה
        const lastUserMessage = messages[messages.length - 1];
        const previousMessages = messages.slice(0, -1);
        let history = previousMessages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));
        if (history.length > 0 && history[0].role === "model")
            history = history.slice(1);

        const chat = model.startChat({ history });

        console.log(`📨 Request to Gemini (${activePersona || "default"})...`);

        const result = await chat.sendMessage(
            systemPrompt + "\n\n" + lastUserMessage.content
        );
        const response = await result.response;

        // טיפול בפונקציות
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            console.log("🔧 Gemini executing:", call.name);

            let functionResult;

            if (call.name === "check_availability") {
                functionResult = await getAvailableSlots();
            } else if (call.name === "book_appointment") {
                const { date, time, name, phone } = call.args as any;
                console.log("📝 Booking details:", date, time, name, phone);
                // המרה בטוחה למחרוזות
                functionResult = await bookAppointment(
                    String(date),
                    String(time),
                    String(name),
                    String(phone)
                );
            }

            const result2 = await chat.sendMessage([
                {
                    functionResponse: {
                        name: call.name,
                        response: { output: functionResult },
                    },
                },
            ]);

            return NextResponse.json({ reply: result2.response.text() });
        }

        return NextResponse.json({ reply: response.text() });
    } catch (error: any) {
        console.error("Error:", error.message);
        return NextResponse.json({ reply: "תקלה בתקשורת." });
    }
}
