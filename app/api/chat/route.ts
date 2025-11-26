import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    getAvailableSlots,
    bookAppointment,
    getClientHistory,
} from "@/lib/simplybook";
import connectDB from "@/lib/db";
import Client from "@/models/Client";
import Conversation from "@/models/Conversation";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            return NextResponse.json({ reply: "שגיאה: חסר מפתח API." });

        const body = await req.json();
        const { messages, businessConfig, activePersona, conversationId } =
            body;

        await connectDB();

        // --- 1. זיהוי והכנת נתונים ---
        let simplyBookCreds: { companyLogin: string; apiKey: string } | null =
            null;
        let clientDoc: any = null;

        if (businessConfig.slug && businessConfig.slug !== "demo") {
            clientDoc = await Client.findOne({ slug: businessConfig.slug });
            if (clientDoc?.integrations?.simplybook?.isConnected) {
                simplyBookCreds = {
                    companyLogin:
                        clientDoc.integrations.simplybook.companyLogin,
                    apiKey: clientDoc.integrations.simplybook.apiKey,
                };
            }
        } else if (businessConfig.slug === "demo") {
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

        const genAI = new GoogleGenerativeAI(apiKey);

        // --- 2. הגדרת כלים (Tools) לפי סוכן ---
        let tools: any[] = [];
        let systemPrompt = "";

        // פונקציות עזר לבניית כלים
        const availabilityTool = {
            name: "check_availability",
            description: "בודק תורים פנויים ביומן.",
        };

        const bookingTool = {
            name: "book_appointment",
            description: "קובע תור חדש ביומן.",
            parameters: {
                type: "OBJECT",
                properties: {
                    date: { type: "STRING" },
                    time: { type: "STRING" },
                    name: { type: "STRING" },
                    phone: { type: "STRING" },
                },
                required: ["date", "time", "name", "phone"],
            },
        };

        // === דניאלה: מנהלת התפעול (Ops Manager) ===
        if (!activePersona || activePersona === "receptionist") {
            const daniellaTools = [];

            if (simplyBookCreds) {
                daniellaTools.push(availabilityTool);
                daniellaTools.push(bookingTool);
                daniellaTools.push({
                    name: "get_client_history",
                    description:
                        "חיפוש היסטוריית תורים של לקוחה ספציפית כדי לדעת מתי הייתה או מתי תבוא.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            query: {
                                type: "STRING",
                                description: "שם הלקוחה או מספר טלפון",
                            },
                        },
                        required: ["query"],
                    },
                });
            }

            daniellaTools.push({
                name: "update_business_profile",
                description: "עדכון פרטי העסק במערכת (כמו שם העסק, שם הבעלים).",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        field: {
                            type: "STRING",
                            enum: ["businessName", "ownerName"],
                            description: "השדה לעדכון",
                        },
                        value: { type: "STRING", description: "הערך החדש" },
                    },
                    required: ["field", "value"],
                },
            });

            tools = [{ functionDeclarations: daniellaTools }];

            systemPrompt = `
                את דניאלה, מנהלת התפעול הראשית והעוזרת האישית של "${businessConfig.businessName}".
                תפקידך: לנהל את העסק ביד רמה.
                הנחיות: דברי כמנהלת יעילה. השתמשי בכלים שברשותך.
            `;
        }

        // === מיכל: מנהלת שיווק ===
        else if (activePersona === "marketing") {
            // לוגיקה מקוצרת לשליפת מידע (כמו בקוד הקודם)
            let marketInsights = "אין נתונים כרגע.";
            if (clientDoc) {
                const recentConvs = await Conversation.find({
                    clientId: clientDoc._id,
                })
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .select("messages");
                if (recentConvs.length > 0) {
                    marketInsights = "יש שיחות אחרונות במערכת."; // לקיצור הקוד כאן
                }
            }

            systemPrompt = `
                את מיכל, מנהלת השיווק של "${businessConfig.businessName}".
                מידע מהשטח: ${marketInsights}
                הנחיות: תני רעיונות לסטורי ולשיווק.
            `;
        }

        // === רועי: אנליסט ===
        else if (activePersona === "analyst") {
            systemPrompt = `אתה רועי, האנליסט העסקי של "${businessConfig.businessName}".`;
        }

        systemPrompt += `\nבעלים: ${businessConfig.ownerName}\nענה בעברית בלבד.`;

        // --- 3. הכנת ההיסטוריה (התיקון הקריטי) ---
        const lastUserMessage = messages[messages.length - 1];
        const previousMessages = messages.slice(0, -1);

        // המרה לפורמט של גוגל
        let history = previousMessages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        // === התיקון: הסרת הודעות התחלה שאינן User ===
        // אנחנו מורידים כל הודעה מתחילת הרשימה כל עוד היא לא 'user'
        while (history.length > 0 && history[0].role !== "user") {
            history.shift();
        }
        // ============================================

        const modelParams: any = { model: "gemini-2.0-flash" };
        if (tools.length > 0) modelParams.tools = tools;

        const model = genAI.getGenerativeModel(modelParams);

        const chat = model.startChat({ history });
        console.log(`📨 Request to Gemini (${activePersona || "Daniella"})...`);

        const result = await chat.sendMessage(
            systemPrompt + "\n\n" + lastUserMessage.content
        );
        const response = await result.response;
        let finalReply = response.text();

        // --- 4. טיפול בפונקציות ---
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            console.log("🔧 Tool Executing:", call.name);
            let functionResult = "שגיאה בביצוע הפעולה.";

            if (simplyBookCreds) {
                if (call.name === "check_availability") {
                    functionResult = await getAvailableSlots(
                        simplyBookCreds.companyLogin,
                        simplyBookCreds.apiKey
                    );
                } else if (call.name === "book_appointment") {
                    const args = call.args as any;
                    functionResult = await bookAppointment(
                        String(args.date),
                        String(args.time),
                        String(args.name),
                        String(args.phone),
                        simplyBookCreds.companyLogin,
                        simplyBookCreds.apiKey
                    );
                } else if (call.name === "get_client_history") {
                    const args = call.args as any;
                    functionResult = await getClientHistory(
                        String(args.query),
                        simplyBookCreds.companyLogin,
                        simplyBookCreds.apiKey
                    );
                }
            }

            if (call.name === "update_business_profile" && clientDoc) {
                const args = call.args as any;
                const updateData: any = {};
                updateData[args.field] = args.value;
                await Client.findByIdAndUpdate(clientDoc._id, updateData);

                // רענון מטמון
                revalidatePath(`/dashboard/${businessConfig.slug}`);
                revalidatePath(`/c/${businessConfig.slug}`);

                functionResult = `הפרטים עודכנו בהצלחה! (בוצע שינוי מערכת)`;
            }

            const result2 = await chat.sendMessage([
                {
                    functionResponse: {
                        name: call.name,
                        response: { output: functionResult },
                    },
                },
            ]);
            finalReply = result2.response.text();
        }

        return NextResponse.json({ reply: finalReply });
    } catch (error: any) {
        console.error("API Error:", error.message);
        return NextResponse.json({ reply: "תקלה בתקשורת." });
    }
}
