import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import ChatExternal from "@/models/ChatExternal";
import Customer from "@/models/Customer";
import ActionCard from "@/models/ActionCard";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";
import { Types } from "mongoose";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in .env.local file");
}

const genAI = new GoogleGenerativeAI(apiKey);

// --- Tool Definitions ---

const commonTools = {
    function_declarations: [
        {
            name: "check_availability",
            description: "Checks availability for appointments.",
            parameters: {
                type: "OBJECT",
                properties: {
                    date: { type: "STRING", description: "Date to check (YYYY-MM-DD)" },
                    service: { type: "STRING", description: "Service name" }
                },
                required: ["date"]
            }
        }
    ]
};

const publicTools = {
    function_declarations: [
        ...commonTools.function_declarations,
        {
            name: "book_appointment",
            description: "Books a new appointment.",
            parameters: {
                type: "OBJECT",
                properties: {
                    date: { type: "STRING" },
                    time: { type: "STRING" },
                    service: { type: "STRING" },
                    customer_name: { type: "STRING" },
                    customer_phone: { type: "STRING" }
                },
                required: ["date", "time", "service", "customer_phone"]
            }
        },
        {
            name: "create_action_card",
            description: "Creates an action card for the manager (Golda) to review. Use this for cancellations, special requests, or issues requiring approval.",
            parameters: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING", description: "Short title of the request" },
                    description: { type: "STRING", description: "Detailed description of the request and context" },
                    priority: { type: "STRING", enum: ["low", "medium", "high", "urgent"] }
                },
                required: ["title", "description"]
            }
        }
    ]
};

const adminTools = {
    function_declarations: [
        ...commonTools.function_declarations,
        {
            name: "cancel_appointment",
            description: "Cancels an existing appointment. ADMIN ONLY.",
            parameters: {
                type: "OBJECT",
                properties: {
                    appointment_id: { type: "STRING" },
                    reason: { type: "STRING" }
                },
                required: ["appointment_id"]
            }
        },
        {
            name: "update_settings",
            description: "Updates business settings.",
            parameters: {
                type: "OBJECT",
                properties: {
                    setting_key: { type: "STRING" },
                    value: { type: "STRING" }
                },
                required: ["setting_key", "value"]
            }
        }
    ]
};

export async function POST(req: NextRequest) {
    try {
        const { message, businessId, sessionId, agentPersona = "daniela" } = await req.json();

        if (!message || !businessId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        // 1. Load Context (Business)
        let business;
        if (businessId === "demo") {
            business = {
                _id: "demo",
                businessName: "Demo Clinic",
                operational_settings: {
                    opening_hours: { "sunday": "09:00-18:00" },
                    services: ["Botox", "Fillers"]
                },
                ai_settings: {
                    tone: "Friendly",
                    language: "he"
                }
            };
        } else {
            business = await Business.findById(businessId).lean();
            if (!business) {
                return NextResponse.json(
                    { error: "Business not found" },
                    { status: 404 }
                );
            }
        }

        // 2. Manage Conversation (ChatExternal)
        let chat;
        let history: any[] = [];
        let customer = null;

        if (sessionId && Types.ObjectId.isValid(sessionId)) {
            chat = await ChatExternal.findById(sessionId);
        }

        if (!chat) {
            // Create new conversation
            const tenantId = businessId === "demo" ? new Types.ObjectId("000000000000000000000000") : businessId;
            chat = await ChatExternal.create({
                business_id: tenantId,
                messages: [],
                processed_for_insights: false
            });
        } else {
            // Load history
            history = chat.messages.map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: m.parts.map((p: any) => ({ text: p.text }))
            }));

            // Fetch Customer if linked
            if (chat.customer_id) {
                customer = await Customer.findById(chat.customer_id).lean();
            }
        }

        // 3. Prepare Context & Prompt
        let clientHistorySummary = "No previous history.";
        if (agentPersona === "daniela" && customer) {
            clientHistorySummary = `Customer Name: ${customer.name}. Last Visit: ${customer.financial_metrics?.last_purchase_date}. Notes: ${customer.ai_memory?.summary}`;
        }

        const promptFn = AGENT_PROMPTS[agentPersona as keyof typeof AGENT_PROMPTS] || AGENT_PROMPTS.daniela;
        const systemPrompt = promptFn({
            ...business,
            client_history_summary: clientHistorySummary
        });

        // 4. Select Tools
        const tools = (agentPersona === "golda") ? [adminTools] : [publicTools];

        // 5. AI Execution
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            tools: tools as any
        });

        // Inject system prompt into history (Gemini Pro compat)
        const chatHistory = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I am ready." }] },
            ...history
        ];

        const chatSession = model.startChat({
            history: chatHistory,
        });

        const result = await chatSession.sendMessage(message);
        const response = result.response;
        let responseText = response.text();
        const functionCalls = response.functionCalls();

        // 6. Handle Function Calls (Tool Execution)
        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (call.name === "create_action_card") {
                    const args = call.args as any;
                    if (businessId !== "demo") {
                        await ActionCard.create({
                            business_id: business._id,
                            source_agent: "receptionist",
                            status: "pending",
                            priority: args.priority || "medium",
                            display_content: {
                                title: args.title,
                                description: args.description,
                                icon: "AlertCircle"
                            },
                            execution_payload: {
                                action_type: "cancel_appointment", // Defaulting for now, or infer from desc
                                params: {
                                    original_message: message,
                                    chat_id: chat._id,
                                    details: args.description
                                }
                            }
                        });
                    }
                    responseText = "העברתי את הבקשה שלך למנהלת הקליניקה (גולדה) לאישור מיידי. נחזור אליך בהקדם.";
                }
                // Handle other tools (book_appointment, etc.) - Mocking success for now
                if (call.name === "book_appointment") {
                    responseText = "מעולה, קבעתי לך את התור. נתראה!";
                }
            }
        }

        // 7. Persistence
        // Ensure parts structure is correct
        chat.messages.push({
            role: "user",
            parts: [{ text: message }],
            timestamp: new Date()
        } as any);

        chat.messages.push({
            role: "model",
            parts: [{ text: responseText }],
            timestamp: new Date()
        } as any);

        await chat.save();

        return NextResponse.json({
            response: responseText,
            sessionId: chat._id,
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                details: error.message || "Unknown error"
            },
            { status: 500 }
        );
    }
}
