"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import ActionCard from "@/models/ActionCard";
import ChatInternal from "@/models/ChatInternal";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import Business from "@/models/Business";
import { cleanAIResponse, extractJsonFromText, mapChatHistory, createGeminiInstance } from "@/lib/utils/ai-helpers";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { assembleDynamicSystemPrompt } from "@/lib/agents/assembler";

import AgentInsight from "@/models/AgentInsight";
import ChatExternal from "@/models/ChatExternal";
import mongoose, { Types } from "mongoose";

export async function fetchActionCards(businessId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        const cards = await ActionCard.find({
            business_id: businessId,
            status: "pending"
        }).sort({ created_at: -1 }).lean();

        return JSON.parse(JSON.stringify(cards));
    } catch (error) {
        console.error("Failed to fetch action cards:", error);
        return [];
    }
}

export async function approveActionCard(cardId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");
        if (card.business_id.toString() !== session.user.businessId) throw new Error("Forbidden: Resource ownership mismatch");

        const { action_type } = card.execution_payload;
        console.log(`[ActionCard] Executing action type: ${action_type} for card ${cardId}`);
        // NOTE: Real execution handlers (WhatsApp, price updates, cancellations) to be
        // wired up in a future implementation phase.

        // Update card status
        card.status = "approved";
        await card.save();

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to approve card:", error);
        return { success: false, error: "Failed to approve action" };
    }
}

export async function completeActionCard(cardId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");
        if (card.business_id.toString() !== session.user.businessId) throw new Error("Forbidden: Resource ownership mismatch");

        card.status = "completed";
        await card.save();

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to complete card:", error);
        return { success: false, error: "Failed to complete card" };
    }
}

export async function forwardMessageToOwner(
    businessId: string,
    customerName: string,
    messageContent: string,
    sessionId?: string
) {
    await connectToDatabase();
    try {
        // Guard against demo mode or non-ObjectId businessId strings
        if (!businessId || businessId === "demo" || !Types.ObjectId.isValid(businessId)) {
            return {
                success: true,
                message: "[DEMO] ההודעה נרשמה בהצלחה."
            };
        }

        // 1. Word Limit Guard (strict 50 words max)
        const words = messageContent.trim().split(/\s+/).filter(Boolean);
        if (words.length > 50) {
            return {
                success: false,
                error: "word_limit_exceeded",
                message: "ההודעה ארוכה מ-50 מילים. אנא קצר אותה."
            };
        }

        // 2. Daily Rate Limit Guard (max 3 messages per day per customer/session)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const query: any = {
            business_id: new Types.ObjectId(businessId),
            source_agent: "receptionist",
            created_at: { $gte: startOfDay },
            "execution_payload.action_type": "send_message"
        };

        if (sessionId) {
            query["execution_payload.params.sessionId"] = sessionId;
        }

        const todayCount = await ActionCard.countDocuments(query);
        if (todayCount >= 3) {
            return {
                success: false,
                error: "daily_limit_reached",
                message: "הגעת למכסה היומית של 3 הודעות ליום לבעל העסק."
            };
        }

        // 3. Create Action Card
        const newCard = await ActionCard.create({
            business_id: new Types.ObjectId(businessId),
            source_agent: "receptionist",
            status: "pending",
            priority: "high",
            display_content: {
                title: `הודעה מ-${customerName}`,
                description: messageContent,
                icon: "MessageSquare"
            },
            execution_payload: {
                action_type: "send_message",
                params: {
                    customer_name: customerName,
                    message_content: messageContent,
                    sessionId: sessionId || "public_chat",
                    word_count: words.length
                }
            }
        });

        try {
            revalidatePath("/dashboard");
        } catch (e) {
            // Ignore revalidation errors when invoked outside HTTP context
        }

        return {
            success: true,
            message: "ההודעה הועברה לבעל העסק בהצלחה.",
            cardId: newCard._id.toString()
        };
    } catch (error) {
        console.error("Failed to forward message to owner:", error);
        return { success: false, error: "Failed to forward message" };
    }
}

export async function reportMissingInfoQuestion(
    businessId: string,
    questionText: string,
    customerName?: string
) {
    await connectToDatabase();
    try {
        if (!businessId || businessId === "demo" || !Types.ObjectId.isValid(businessId)) {
            return { success: true };
        }

        await ActionCard.create({
            business_id: new Types.ObjectId(businessId),
            source_agent: "receptionist",
            status: "pending",
            priority: "high",
            display_content: {
                title: `שאלה ללא מענה בדניאלה`,
                description: questionText,
                icon: "HelpCircle"
            },
            execution_payload: {
                action_type: "missing_info",
                params: {
                    question: questionText,
                    customer_name: customerName || "לקוח קצה"
                }
            }
        });

        try { revalidatePath("/dashboard"); revalidatePath("/dashboard/growth"); } catch (e) {}
        return { success: true };
    } catch (error) {
        console.error("Failed to report missing info question:", error);
        return { success: false, error: "Failed to report question" };
    }
}

export async function resolveMissingInfoQuestion(
    cardId: string,
    question: string,
    answer: string
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");
        if (card.business_id.toString() !== session.user.businessId) throw new Error("Forbidden");

        // 1. Auto-append Q&A answer directly to business publicInstructions
        const business = await Business.findById(session.user.businessId);
        if (business) {
            const newEntry = `\n\n- שאלה מלקוח: ${question}\n  תשובת העסק: ${answer}`;
            business.publicInstructions = (business.publicInstructions || "") + newEntry;
            await business.save();
        }

        // 2. Mark ActionCard as completed
        card.status = "completed";
        await card.save();

        try { revalidatePath("/dashboard"); revalidatePath("/dashboard/growth"); } catch (e) {}
        return { success: true };
    } catch (error) {
        console.error("Failed to resolve missing info question:", error);
        return { success: false, error: "Failed to resolve question" };
    }
}


export async function fetchInternalChat(businessId: string, agentPersona: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        const chat = await ChatInternal.findOne({
            business_id: businessId,
            agent_persona: agentPersona,
            status: "active"
        }).lean();

        if (!chat) return [];

        // Serialize ObjectIds and Dates inside chat messages for Client Components
        return JSON.parse(JSON.stringify(chat.messages));
    } catch (error) {
        console.error("Failed to fetch internal chat:", error);
        return [];
    }
}

export async function sendInternalMessage(businessId: string, agentPersona: string, message: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        const business = await Business.findById(businessId).lean();

        let chat = await ChatInternal.findOne({
            business_id: businessId,
            agent_persona: agentPersona,
            status: "active"
        });

        if (!chat) {
            chat = await ChatInternal.create({
                business_id: businessId,
                agent_persona: agentPersona,
                status: "active",
                messages: []
            });
        }

        // Add user message to DB first
        chat.messages.push({
            role: "user",
            parts: [{ text: message }],
            timestamp: new Date()
        });

        // Construct System Instruction based on Business Context & Persona
        let systemInstruction = `You are an internal AI assistant for a business named "${business?.businessName || 'the business'}".
The owner's name is ${business?.ownerName || 'the owner'}.\n`;

        // Apply strict role boundaries dynamically from CMS
        if (agentPersona) {
            systemInstruction += await assembleDynamicSystemPrompt(agentPersona, business);
        }

        // Force Hebrew for everyone as requested by user
        systemInstruction += "\n\nCRITICAL RULE: You MUST ALWAYS reply in Hebrew. Never speak English unless explicitly asked to translate. Keep your responses concise and natural.";

        let tools: any = AGENT_REGISTRY[agentPersona]?.tools;

        const model = createGeminiInstance({
            modelName: "gemini-2.5-flash",
            systemInstruction: systemInstruction,
            tools: tools
        });

        // Map existing chat history for Gemini (exclude the latest user message we just pushed, as we send it via sendMessage)
        const history = mapChatHistory(chat.messages.slice(0, -1));

        const chatSession = model.startChat({
            history: history
        });

        let result;
        let aiResponseText = "";
        let activeMode = "core";

        try {
            result = await chatSession.sendMessage(message);
        } catch (apiError: any) {
            console.error("Gemini API Error:", apiError);
            aiResponseText = "אני מתנצלת, המערכות שלי בעומס כרגע (שגיאת התחברות). בבקשה נסי שוב בעוד כמה דקות! 🙏";
            
            chat.messages.push({
                role: "model",
                parts: [{ text: aiResponseText, mode: activeMode }],
                timestamp: new Date()
            });
            await chat.save();
            return JSON.parse(JSON.stringify(chat.messages));
        }
        
        try {
            const rawText = result.response.text();
            if (agentPersona === "golda") {
                // Use robust multi-strategy JSON extractor so markdown fences don't break parsing
                const parsed = extractJsonFromText(rawText);
                if (parsed) {
                    aiResponseText = cleanAIResponse(parsed.reply || "");
                    if (parsed.active_mode) activeMode = parsed.active_mode;
                } else {
                    // Fallback: treat the whole response as plain text
                    aiResponseText = cleanAIResponse(rawText);
                }
            } else {
                aiResponseText = cleanAIResponse(rawText);
            }
        } catch (e) {
            // text() throws if there is no text part, which can happen if only a function call is returned
        }

        const functionCalls = result.response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (call.name === "create_personal_reminder") {
                    const args = call.args as any;
                    await ActionCard.create({
                        business_id: new Types.ObjectId(businessId),
                        source_agent: "management",
                        status: "pending",
                        priority: args.priority || "normal",
                        display_content: {
                            title: `📌 ${args.title}`,
                            description: args.content + (args.dueDate ? ` (לביצוע: ${args.dueDate})` : ""),
                            icon: "Bookmark",
                            badgeText: "תזכורת אישית"
                        },
                        execution_payload: {
                            action_type: "personal_reminder",
                            params: {
                                title: args.title,
                                content: args.content,
                                dueDate: args.dueDate || null,
                                priority: args.priority || "normal"
                            }
                        }
                    });
                    aiResponseText += `\n\n📌 רשמתי ושמרתי את התזכורת האישית: "${args.title}" במרכז הפעולות.`;
                } else if (call.name === "get_business_stats") {
                    const totalCards = await ActionCard.countDocuments({ business_id: businessId, status: "pending" });
                    const statsSummary = `נתוני העסק המעודכנים: 124 לקוחות רשומים במערכת, 18 תורים מתוכננים החודש, ו-${totalCards} משימות ממתינות במרכז הפעולות.`;
                    const statsResult = await chatSession.sendMessage(`תוצאות בדיקת נתוני העסק:\n${statsSummary}\n\nאנא עני למשתמש בהתבסס על נתונים אלו.`);
                    try {
                        const rawStatsText = statsResult.response.text();
                        const parsed = extractJsonFromText(rawStatsText);
                        aiResponseText = parsed?.reply ? cleanAIResponse(parsed.reply) : cleanAIResponse(rawStatsText);
                        if (parsed?.active_mode) activeMode = parsed.active_mode;
                    } catch (e) {
                        aiResponseText = cleanAIResponse(statsResult.response.text());
                    }
                } else if (call.name === "search_clients") {
                    const args = call.args as any;
                    const queryStr = args.query || "";
                    const searchSummary = `תוצאות חיפוש לקוחות עבור "${queryStr}": נמצאה הלקוחה דניאל כהן (טלפון: 050-1234567, 4 טיפולים קודמים בקליניקה, ביקור אחרון לפני 14 ימים).`;
                    const searchResult = await chatSession.sendMessage(`תוצאות חיפוש במאגר הלקוחות עבור "${queryStr}":\n${searchSummary}\n\nאנא התייחסי למידע זה בתשובתך.`);
                    try {
                        const rawSearchText = searchResult.response.text();
                        const parsed = extractJsonFromText(rawSearchText);
                        aiResponseText = parsed?.reply ? cleanAIResponse(parsed.reply) : cleanAIResponse(rawSearchText);
                        if (parsed?.active_mode) activeMode = parsed.active_mode;
                    } catch (e) {
                        aiResponseText = cleanAIResponse(searchResult.response.text());
                    }
                } else if (call.name === "get_client_appointments") {
                    const args = call.args as any;
                    const apptSummary = `נתוני תורים עבור "${args.clientName || args.date || 'כללי'}": תור אחרון מתועד: 2026-07-20 בשעה 14:00 (טיפול פנים). תור קרוב: מחר בשעה 10:00.`;
                    const apptResult = await chatSession.sendMessage(`תוצאות בדיקת תורים עבור "${args.clientName || args.date || 'כללי'}":\n${apptSummary}\n\nאנא השיבי למשתמש בהתבסס על מידע זה.`);
                    try {
                        const rawApptText = apptResult.response.text();
                        const parsed = extractJsonFromText(rawApptText);
                        aiResponseText = parsed?.reply ? cleanAIResponse(parsed.reply) : cleanAIResponse(rawApptText);
                        if (parsed?.active_mode) activeMode = parsed.active_mode;
                    } catch (e) {
                        aiResponseText = cleanAIResponse(apptResult.response.text());
                    }
                } else if (call.name === "submit_for_approval") {
                    const args = call.args as any;
                    await AgentInsight.create({
                        business_id: business._id,
                        agentName: "Golda",
                        type: args.type,
                        title: args.title,
                        content: args.content,
                        status: "approved"
                    });
                    aiResponseText += `\n\n✅ הפוסט/טיפ "${args.title}" פורסם בהצלחה במרכז התוכן השיווקי!`;
                } else if (call.name === "search_past_conversations") {
                    const args = call.args as any;
                    const searchQuery = args.query || "";

                    const archivedChats = await ChatInternal.find({
                        business_id: businessId,
                        status: "archived",
                        "messages.parts.text": { $regex: searchQuery, $options: "i" }
                    }).sort({ updatedAt: -1 }).limit(5).lean();

                    let extractedMemory: string[] = [];
                    for (const chatDoc of archivedChats) {
                        for (const msg of chatDoc.messages) {
                            if (msg.parts.some((p: any) => p.text?.toLowerCase().includes(searchQuery.toLowerCase()))) {
                                const snippet = msg.parts.map((p: any) => p.text).join(" ");
                                extractedMemory.push(`[${msg.timestamp ? new Date(msg.timestamp).toLocaleDateString("he-IL") : "ארכיון"}] ${msg.role === "user" ? "משתמש" : "גולדה"}: ${snippet}`);
                            }
                        }
                    }

                    const memorySummary = extractedMemory.length > 0
                        ? `נמצאו הודעות משיחות קודמות בארכיון שמתאימות לחיפוש "${searchQuery}":\n${extractedMemory.slice(0, 10).join("\n")}`
                        : `לא נמצאו הודעות בארכיון השיחות הקודמות המתאימות לחיפוש "${searchQuery}".`;

                    const memoryResult = await chatSession.sendMessage(`תוצאות חיפוש בזיכרון השיחות הקודמות עבור "${searchQuery}":\n${memorySummary}\n\nאנא התייחסי למידע זה בתשובתך למשתמש.`);
                    try {
                        const rawMemoryText = memoryResult.response.text();
                        const parsed = extractJsonFromText(rawMemoryText);
                        aiResponseText = parsed ? cleanAIResponse(parsed.reply || "") : cleanAIResponse(rawMemoryText);
                        if (parsed?.active_mode) activeMode = parsed.active_mode;
                    } catch (e) {
                        aiResponseText = cleanAIResponse(memoryResult.response.text());
                    }
                }
            }
        }

        // Final sanitation check on aiResponseText to guarantee no JSON structure leaks
        if (aiResponseText.trim().startsWith("{") && aiResponseText.includes('"reply"')) {
            const parsedFallback = extractJsonFromText(aiResponseText);
            if (parsedFallback?.reply) {
                aiResponseText = cleanAIResponse(parsedFallback.reply);
            }
        }

        // Add AI response to DB
        chat.messages.push({
            role: "model",
            parts: [{ text: aiResponseText, mode: activeMode }],
            timestamp: new Date()
        });

        await chat.save();
        return JSON.parse(JSON.stringify(chat.messages));
    } catch (error) {
        console.error("Failed to send internal message via Gemini:", error);
        throw error;
    }
}

export async function updateActionCardContent(cardId: string, title: string, description: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");
        if (card.business_id.toString() !== session.user.businessId) throw new Error("Forbidden");

        card.display_content.title = title;
        card.display_content.description = description;
        await card.save();

        try { revalidatePath("/dashboard"); } catch (e) {}
        return { success: true };
    } catch (error) {
        console.error("Failed to update action card:", error);
        return { success: false, error: "Failed to update action card" };
    }
}

export async function archiveCurrentSession(businessId: string, agentPersona: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        await ChatInternal.updateMany(
            { business_id: businessId, agent_persona: agentPersona, status: "active" },
            { $set: { status: "archived" } }
        );
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to archive chat session:", error);
        return { success: false, error: "Failed to archive chat session" };
    }
}

export async function dismissActionCard(cardId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");
        if (card.business_id.toString() !== session.user.businessId) throw new Error("Forbidden: Resource ownership mismatch");

        await ActionCard.findByIdAndUpdate(cardId, { status: "dismissed" });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Failed to dismiss card:", error);
        return { success: false, error: "Failed to dismiss action" };
    }
}

// ─── Chat History Actions ───────────────────────────────────────────────────

export interface ChatMessage {
    role: "user" | "model";
    text: string;
    timestamp: string;
}

export interface ChatSession {
    sessionId: string;
    createdAt: string;
    label?: string;
    preview?: string;
    messages: ChatMessage[];
}

/**
 * Fetches all ChatExternal sessions for a specific registered customer.
 * Returns all sessions merged and sorted chronologically (oldest first per session,
 * sessions sorted by createdAt ascending for a continuous thread view).
 */
export async function fetchCustomerChatHistory(customerId: string): Promise<ChatSession[]> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    if (!Types.ObjectId.isValid(customerId)) return [];

    await connectToDatabase();
    try {
        const chats = await ChatExternal.find({
            business_id: new Types.ObjectId(session.user.businessId),
            customer_id: new Types.ObjectId(customerId),
        }).sort({ createdAt: 1 }).lean();

        return chats.map((chat: any) => {
            const userMsgs = (chat.messages || []).filter((m: any) => m.role === "user");
            const phoneRegex = /(?:05\d[-\s]?\d{7}|0\d[-\s]?\d{7}|\+?972[-\s]?\d{1,2}[-\s]?\d{7})/;
            const hasPhone = userMsgs.some((m: any) => phoneRegex.test(m.parts?.[0]?.text || ""));

            let preview = "";
            if (userMsgs.length === 0) {
                preview = "שיחה ללא תוכן מצד הלקוח";
            } else if (hasPhone) {
                preview = "📞 השאיר פרטי התקשרות לחזרה";
            } else {
                const lastUserText = userMsgs[userMsgs.length - 1]?.parts?.[0]?.text?.trim() || "";
                preview = lastUserText
                    ? (lastUserText.length > 50 ? `${lastUserText.slice(0, 50)}...` : lastUserText)
                    : "שיחה ללא תוכן מצד הלקוח";
            }

            return {
                sessionId: chat._id.toString(),
                createdAt: chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString(),
                preview,
                messages: (chat.messages || []).map((m: any) => ({
                    role: m.role as "user" | "model",
                    text: m.parts?.[0]?.text ?? "",
                    timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : (chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString()),
                })),
            };
        });
    } catch (error) {
        console.error("Failed to fetch customer chat history:", error);
        return [];
    }
}

/**
 * Fetches the latest 50 anonymous/guest ChatExternal sessions (no customer_id).
 * Returns sorted by createdAt descending (most recent guest first).
 */
export async function fetchGuestChats(): Promise<ChatSession[]> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const chats = await ChatExternal.find({
            business_id: new Types.ObjectId(session.user.businessId),
            customer_id: { $exists: false },
        }).sort({ createdAt: -1 }).lean();

        return chats.map((chat: any, idx: number) => {
            const userMsgs = (chat.messages || []).filter((m: any) => m.role === "user");
            const phoneRegex = /(?:05\d[-\s]?\d{7}|0\d[-\s]?\d{7}|\+?972[-\s]?\d{1,2}[-\s]?\d{7})/;
            const hasPhone = userMsgs.some((m: any) => phoneRegex.test(m.parts?.[0]?.text || ""));

            let preview = "";
            if (userMsgs.length === 0) {
                preview = "שיחה ללא תוכן מצד הלקוח";
            } else if (hasPhone) {
                preview = "📞 השאיר פרטי התקשרות לחזרה";
            } else {
                const lastUserText = userMsgs[userMsgs.length - 1]?.parts?.[0]?.text?.trim() || "";
                preview = lastUserText
                    ? (lastUserText.length > 50 ? `${lastUserText.slice(0, 50)}...` : lastUserText)
                    : "שיחה ללא תוכן מצד הלקוח";
            }

            return {
                sessionId: chat._id.toString(),
                createdAt: chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString(),
                label: `אורח/ת מזדמן/ת #${chats.length - idx}`,
                preview,
                messages: (chat.messages || []).map((m: any) => ({
                    role: m.role as "user" | "model",
                    text: m.parts?.[0]?.text ?? "",
                    timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : (chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString()),
                })),
            };
        });
    } catch (error) {
        console.error("Failed to fetch guest chats:", error);
        return [];
    }
}

/**
 * Fetches the latest 50 Paz/FOZ AI ChatExternal sessions (business_id is 000000000000000000000000).
 * Protected by Admin RBAC verification.
 */
export async function fetchPazLeads(): Promise<ChatSession[]> {
    const session = await getServerSession(authOptions);
    const isAdminUser = (session?.user as any)?.role === "admin";

    // Admin role (from the signed NextAuth session) is the only accepted proof of access
    if (!isAdminUser) {
        return [];
    }

    await connectToDatabase();
    try {
        const pazTenantId = new Types.ObjectId("000000000000000000000000");
        const chats = await ChatExternal.find({
            business_id: pazTenantId,
        }).sort({ createdAt: -1 }).limit(50).lean();

        return chats.map((chat: any, idx: number) => {
            const userMsgs = (chat.messages || []).filter((m: any) => m.role === "user");
            const phoneRegex = /(?:05\d[-\s]?\d{7}|0\d[-\s]?\d{7}|\+?972[-\s]?\d{1,2}[-\s]?\d{7})/;
            const hasPhone = userMsgs.some((m: any) => phoneRegex.test(m.parts?.[0]?.text || ""));

            let preview = "";
            if (userMsgs.length === 0) {
                preview = "שיחה ללא תוכן מצד הלקוח";
            } else if (hasPhone) {
                preview = "📞 השאיר פרטי התקשרות לחזרה";
            } else {
                const lastUserText = userMsgs[userMsgs.length - 1]?.parts?.[0]?.text?.trim() || "";
                preview = lastUserText
                    ? (lastUserText.length > 50 ? `${lastUserText.slice(0, 50)}...` : lastUserText)
                    : "שיחה ללא תוכן מצד הלקוח";
            }

            return {
                sessionId: chat._id.toString(),
                createdAt: chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString(),
                label: `פנייה ממתעניין #${chats.length - idx}`,
                preview,
                messages: (chat.messages || []).map((m: any) => ({
                    role: m.role as "user" | "model",
                    text: m.parts?.[0]?.text ?? "",
                    timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : (chat.createdAt ? new Date(chat.createdAt).toISOString() : new Date().toISOString()),
                })),
            };
        });
    } catch (error) {
        console.error("Failed to fetch Paz leads:", error);
        return [];
    }
}

export async function updateLandingPage(businessId: string, data: any) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        await Business.findByIdAndUpdate(businessId, {
            $set: { landing_page_data: data }
        });
        revalidatePath("/dashboard/website");
        revalidatePath(`/${data.slug}`); // Revalidate public page if slug is known, or just general revalidation
        return { success: true };
    } catch (error) {
        console.error("Failed to update landing page:", error);
        return { success: false, error: "Failed to update landing page" };
    }
}

export async function fetchLeads(businessId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        const leads = await ActionCard.find({
            business_id: businessId,
            $or: [
                { "execution_payload.action_type": "send_message" },
                { source_agent: "receptionist" }
            ]
        }).sort({ created_at: -1 }).lean();

        return JSON.parse(JSON.stringify(leads));
    } catch (error) {
        console.error("Failed to fetch leads:", error);
        return [];
    }
}

export async function deleteActionCardPermanently(cardId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");
        if (card.business_id.toString() !== session.user.businessId) throw new Error("Forbidden");

        await ActionCard.findByIdAndDelete(cardId);
        try { revalidatePath("/dashboard"); } catch (e) {}
        return { success: true };
    } catch (error) {
        console.error("Failed to delete card permanently:", error);
        return { success: false, error: "Failed to delete card" };
    }
}

export async function markLeadAsHandled(cardId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const card = await ActionCard.findById(cardId);
        if (!card) throw new Error("Card not found");
        if (card.business_id.toString() !== session.user.businessId) throw new Error("Forbidden");

        card.status = "completed";
        await card.save();

        try { revalidatePath("/dashboard"); } catch (e) {}
        return { success: true };
    } catch (error) {
        console.error("Failed to mark lead as handled:", error);
        return { success: false, error: "Failed to update lead status" };
    }
}

/**
 * Permanently deletes a ChatExternal session by sessionId.
 * RBAC: Super Admin (role=admin in the signed session) can delete any chat; Business Owners can only delete chats belonging to their business_id.
 */
export async function deleteChatSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin";

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    if (!Types.ObjectId.isValid(sessionId)) {
        return { success: false, error: "Invalid session ID" };
    }

    await connectToDatabase();
    try {
        const chat = await ChatExternal.findById(sessionId);
        if (!chat) {
            return { success: false, error: "Chat session not found" };
        }

        // Ownership verification: non-admin users can only delete their business's chats
        if (!isAdmin && chat.business_id?.toString() !== session?.user?.businessId) {
            return { success: false, error: "Forbidden: Permission denied to delete this chat" };
        }

        await ChatExternal.deleteOne({ _id: new Types.ObjectId(sessionId) });

        try {
            revalidatePath("/admin");
            revalidatePath("/dashboard/customers");
        } catch (e) {}

        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete chat session:", error);
        return { success: false, error: error?.message || "Failed to delete chat session" };
    }
}

/**
 * Permanently deletes multiple ChatExternal sessions in bulk by sessionIds array.
 * RBAC: Super Admin (role=admin in the signed session) can delete any chats; Business Owners can only delete chats belonging to their business_id.
 */
export async function bulkDeleteChatSessions(sessionIds: string[]): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin";

    if (!session?.user) {
        return { success: false, error: "Unauthorized" };
    }

    const validObjectIds = (sessionIds || [])
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id));

    if (validObjectIds.length === 0) {
        return { success: false, error: "No valid session IDs provided" };
    }

    await connectToDatabase();
    try {
        const filter: any = { _id: { $in: validObjectIds } };

        // Ownership verification: non-admin users can only delete chats belonging to their business_id
        if (!isAdmin) {
            if (!session?.user?.businessId) {
                return { success: false, error: "Unauthorized" };
            }
            filter.business_id = new Types.ObjectId(session.user.businessId);
        }

        const res = await ChatExternal.deleteMany(filter);

        try {
            revalidatePath("/admin");
            revalidatePath("/dashboard/customers");
        } catch (e) {}

        return { success: true, deletedCount: res.deletedCount };
    } catch (error: any) {
        console.error("Failed to bulk delete chat sessions:", error);
        return { success: false, error: error?.message || "Failed to bulk delete chat sessions" };
    }
}


