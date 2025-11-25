import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAvailableSlots, bookAppointment } from "@/lib/simplybook";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            return NextResponse.json({ reply: "שגיאה: חסר מפתח API." });

        const body = await req.json();
        const { messages, businessConfig, activePersona } = body;

        // --- 1. שליפת מפתחות SimplyBook (החלק שהיה חסר לך) ---
        let simplyBookCreds: { companyLogin: string; apiKey: string } | null =
            null;

        // בדיקה: האם זה לקוח אמיתי או דמו?
        if (businessConfig.slug && businessConfig.slug !== "demo") {
            await connectDB();
            const client = await Client.findOne({ slug: businessConfig.slug });

            // אם ללקוח יש אינטגרציה מחוברת - ניקח משם
            if (client && client.integrations?.simplybook?.isConnected) {
                simplyBookCreds = {
                    companyLogin: client.integrations.simplybook.companyLogin,
                    apiKey: client.integrations.simplybook.apiKey,
                };
            }
        } else if (businessConfig.slug === "demo") {
            // במצב דמו - משתמשים במפתחות שלך מקובץ ה-.env
            if (
                process.env.SIMPLYBOOK_COMPANY &&
                process.env.SIMPLYBOOK_API_KEY
            ) {
                simplyBookCreds = {
                    companyLogin: process.env.SIMPLYBOOK_COMPANY,
                    apiKey: process.env.SIMPLYBOOK_API_KEY,
                };
            }
        }
        // -------------------------------------------------------

        const genAI = new GoogleGenerativeAI(apiKey);

        const isReceptionist =
            !activePersona || activePersona === "receptionist";

        // נותנים לבוט גישה לכלים רק אם יש לנו מפתחות תקינים!
        const hasCalendarAccess = simplyBookCreds !== null;

        const tools =
            isReceptionist && hasCalendarAccess
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
                                      type: "OBJECT",
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
                                      required: [
                                          "date",
                                          "time",
                                          "name",
                                          "phone",
                                      ],
                                  },
                              },
                          ],
                      },
                  ]
                : undefined;

        const modelParams: any = { model: "gemini-2.0-flash" };
        if (tools) modelParams.tools = tools;

        const model = genAI.getGenerativeModel(modelParams);

        // --- בניית הפרומפט ---
        let personaPrompt = "";

        if (activePersona === "marketing") {
            personaPrompt = `
            את מיכל, מנהלת השיווק של "${businessConfig.businessName}".
            הסגנון שלך: אנרגטי, יצירתי, מומחית לאינסטגרם וטיקטוק.
        `;
        } else if (activePersona === "analyst") {
            personaPrompt = `
            אתה רועי, האנליסט העסקי של "${businessConfig.businessName}".
            הסגנון שלך: קצר, ענייני, מבוסס נתונים.
        `;
        } else {
            personaPrompt = `
            את דניאלה, מנהלת הקבלה של "${businessConfig.businessName}".
            הסגנון שלך: שירותי, אדיב ומכירתי.
            המטרה: לנהל את היומן, לבדוק זמינות, ולסגור תורים.
            ${
                !hasCalendarAccess
                    ? "(הערה לעצמך: כרגע אין חיבור ליומן, אז תגידי ללקוח שאת עדיין לא יכולה לקבוע תור טכנית)."
                    : ""
            }
        `;
        }

        const systemPrompt = `
      ${personaPrompt}
      בעלים: ${businessConfig.ownerName}
      מידע כללי: ${businessConfig.domainGuidelines}
      הנחיות: ענה בעברית בלבד.
    `;

        // היסטוריה
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

        // --- טיפול בפונקציות (עם התיקונים שלך) ---
        const functionCalls = response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            console.log("🔧 Gemini executing:", call.name);

            let functionResult;

            // אם הגענו לפה, simplyBookCreds בטוח קיים (בגלל התנאי של tools למעלה),
            // אבל ליתר ביטחון נוסיף בדיקה
            if (!simplyBookCreds) {
                functionResult = "שגיאה טכנית: חסרים פרטי התחברות ליומן.";
            } else {
                if (call.name === "check_availability") {
                    functionResult = await getAvailableSlots(
                        simplyBookCreds.companyLogin,
                        simplyBookCreds.apiKey
                    );
                } else if (call.name === "book_appointment") {
                    const { date, time, name, phone } = call.args as any;
                    console.log("📝 Booking details:", date, time, name, phone);

                    functionResult = await bookAppointment(
                        String(date),
                        String(time),
                        String(name),
                        String(phone),
                        simplyBookCreds.companyLogin,
                        simplyBookCreds.apiKey
                    );
                }
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
