"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import ActionCard from "@/models/ActionCard";
import ChatInternal from "@/models/ChatInternal";
import { revalidatePath } from "next/cache";
import Business from "@/models/Business";
import { cleanAIResponse, extractJsonFromText, mapChatHistory, createGeminiInstance } from "@/lib/utils/ai-helpers";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import PendingAsset from "@/models/PendingAsset";
import AgentInsight from "@/models/AgentInsight";
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

        // Apply strict role boundaries
        if (agentPersona && AGENT_REGISTRY[agentPersona]) {
            systemInstruction += AGENT_REGISTRY[agentPersona].systemPrompt(business);
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
                if (call.name === "submit_for_approval") {
                    const args = call.args as any;
                    await PendingAsset.create({
                        businessId: business._id,
                        agentName: "Golda",
                        type: args.type,
                        title: args.title,
                        content: args.content,
                        status: "pending"
                    });
                    aiResponseText += `\n\n✅ הפוסט/טיפ "${args.title}" נשלח בהצלחה לתור הממתין לאישור!`;
                } else if (call.name === "approve_asset") {
                    const args = call.args as any;
                    const pending = await PendingAsset.findById(args.asset_id);
                    if (pending) {
                        await AgentInsight.create({
                            businessId: pending.businessId,
                            agentName: pending.agentName,
                            type: pending.type,
                            title: pending.title,
                            content: pending.content,
                            status: "approved"
                        });
                        await PendingAsset.findByIdAndDelete(args.asset_id);
                        aiResponseText += `\n\n✅ התוכן אושר ופורסם בהצלחה לדשבורד!`;
                    } else {
                        aiResponseText += `\n\n❌ לא נמצא תוכן ממתין לאישור עם המזהה שסופק.`;
                    }
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

        // Add AI response to DB
        chat.messages.push({
            role: "model",
            parts: [{ text: aiResponseText, mode: activeMode }],
            timestamp: new Date()
        });

        await chat.save();
        // Post-mutation: serialize the mutated document's messages array to plain objects
        return JSON.parse(JSON.stringify(chat.messages));
    } catch (error) {
        console.error("Failed to send internal message via Gemini:", error);
        throw error;
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
        revalidatePath(`/c/${data.slug}`); // Revalidate public page if slug is known, or just general revalidation
        return { success: true };
    } catch (error) {
        console.error("Failed to update landing page:", error);
        return { success: false, error: "Failed to update landing page" };
    }
}

export async function fetchPendingAssets(businessId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        const assets = await PendingAsset.find({
            businessId: businessId,
            status: "pending"
        }).sort({ createdAt: -1 }).lean();

        return JSON.parse(JSON.stringify(assets));
    } catch (error) {
        console.error("Failed to fetch pending assets:", error);
        return [];
    }
}

export async function deletePendingAsset(assetId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");

    await connectToDatabase();
    try {
        const asset = await PendingAsset.findById(assetId);
        if (!asset) throw new Error("Pending asset not found");
        if (asset.businessId.toString() !== session.user.businessId) {
            throw new Error("Forbidden: Resource ownership mismatch");
        }

        await PendingAsset.findByIdAndDelete(assetId);
        revalidatePath("/dashboard/marketing");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete pending asset:", error);
        return { success: false, error: "Failed to delete pending asset" };
    }
}
