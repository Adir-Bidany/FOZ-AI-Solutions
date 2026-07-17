"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import ActionCard from "@/models/ActionCard";
import { revalidatePath } from "next/cache";
import Business from "@/models/Business";
import { cleanAIResponse, mapChatHistory, createGeminiInstance } from "@/lib/utils/ai-helpers";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import PendingAsset from "@/models/PendingAsset";
import AgentInsight from "@/models/AgentInsight";

export async function fetchActionCards(businessId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        const cards = await ActionCard.find({
            business_id: businessId,
            status: "pending"
        }).sort({ created_at: -1 });

        // Serialize MongoDB objects to plain JSON
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

        // Execute the suggested action
        const { action_type, params } = card.execution_payload;
        let result;

        switch (action_type) {
            case "send_message":
                // result = await sendWhatsApp(params.phone, params.message);
                console.log("Mock sendWhatsApp", params);
                break;
            case "update_db":
                // Assuming params has serviceName and newPrice for this example
                if (params.serviceName && params.newPrice) {
                    // result = await updatePriceList(params.serviceName, params.newPrice);
                    console.log("Mock updatePriceList", params);
                }
                break;
            case "cancel_appointment":
                // Implement cancellation logic here
                console.log("Cancelling appointment...", params);
                // result = await cancelAppointment(params.chat_id, params.original_message);
                break;
            // Add other cases as needed
            default:
                console.log(`Action type ${action_type} not implemented yet.`);
        }

        // Update card status
        card.status = "approved";
        await card.save();

        revalidatePath("/dashboard");
        return { success: true, result };
    } catch (error) {
        console.error("Failed to approve card:", error);
        return { success: false, error: "Failed to approve action" };
    }
}

import ChatInternal from "@/models/ChatInternal";

export async function fetchInternalChat(businessId: string, agentPersona: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.businessId) throw new Error("Unauthorized");
    if (session.user.businessId !== businessId) throw new Error("Forbidden: Resource ownership mismatch");

    await connectToDatabase();
    try {
        const chat = await ChatInternal.findOne({
            business_id: businessId,
            agent_persona: agentPersona
        }).lean();

        if (!chat) return [];

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
            agent_persona: agentPersona
        });

        if (!chat) {
            chat = await ChatInternal.create({
                business_id: businessId,
                agent_persona: agentPersona,
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

        // Send the new message to Gemini
        const result = await chatSession.sendMessage(message);
        
        let aiResponseText = "";
        try {
            aiResponseText = cleanAIResponse(result.response.text());
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
                        agentName: agentPersona === "michal" ? "Michal" : "Roi",
                        type: args.type,
                        title: args.title,
                        content: args.content,
                        status: "pending"
                    });
                    aiResponseText += `\n\n✅ הפוסט/טיפ "${args.title}" נשלח בהצלחה לגולדה לאישור!`;
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
                } else if (call.name === "delegate_task") {
                    const args = call.args as any;
                    aiResponseText += `\n\n🔄 מעבירה את המשימה ל${args.target_agent === "michal" ? "מיכל" : "רועי"}...`;
                    
                    // Background Specialist Trigger
                    const specialistPrompt = `גולדה העבירה אליך משימה: ${args.task_description}\nחובה עליך להשתמש בכלי submit_for_approval כדי להגיש את התוצר הסופי לגולדה! עליך להגיב בעברית.`;
                    
                    let specSystemInstruction = `You are an internal AI assistant for a business named "${business?.businessName || 'the business'}".\n`;
                    if (args.target_agent === "michal" && AGENT_REGISTRY.michal) specSystemInstruction += AGENT_REGISTRY.michal.systemPrompt(business);
                    else if (args.target_agent === "roi" && AGENT_REGISTRY.roi) specSystemInstruction += AGENT_REGISTRY.roi.systemPrompt(business);
                    
                    specSystemInstruction += "\n\nCRITICAL RULE: You MUST ALWAYS reply in Hebrew. You MUST use the submit_for_approval tool to submit the requested asset.";

                    const specModel = createGeminiInstance({
                        modelName: "gemini-2.5-flash",
                        systemInstruction: specSystemInstruction,
                        tools: AGENT_REGISTRY[args.target_agent === "michal" ? "michal" : "roi"]?.tools
                    });

                    const specResult = await specModel.generateContent(specialistPrompt);
                    const specCalls = specResult.response.functionCalls();
                    
                    let submittedAsset = null;
                    if (specCalls && specCalls.length > 0) {
                        for (const sCall of specCalls) {
                            if (sCall.name === "submit_for_approval") {
                                const sArgs = sCall.args as any;
                                submittedAsset = await PendingAsset.create({
                                    businessId: business._id,
                                    agentName: args.target_agent === "michal" ? "Michal" : "Roi",
                                    type: sArgs.type,
                                    title: sArgs.title,
                                    content: sArgs.content,
                                    status: "pending"
                                });
                            }
                        }
                    }

                    if (submittedAsset) {
                        aiResponseText += `\nהתוצר נכתב וממתין לאישור שלי. רגע, אעבור עליו עכשיו...`;
                        
                        // Auto-Review Feedback Loop
                        const goldaReviewPrompt = `המשימה בוצעה. ${args.target_agent === "michal" ? "מיכל" : "רועי"} שלח את התוצר הבא לאישורך:\nכותרת: ${submittedAsset.title}\nתוכן: ${submittedAsset.content}\n\nאנא בדקי את התוכן. אם הכל תקין, השתמשי בכלי approve_asset עם asset_id "${submittedAsset._id}" והודיעי למשתמש "העברתי את המשימה. הפוסט/תוצר מוכן ומאושר בעמוד שלה!". אם לא, דחי זאת והסבירי למשתמש מה הבעיה. עני בעברית.`;
                        
                        const reviewResult = await chatSession.sendMessage(goldaReviewPrompt);
                        const reviewCalls = reviewResult.response.functionCalls();
                        let reviewText = "";
                        try { reviewText = reviewResult.response.text(); } catch(e) {}
                        
                        if (reviewCalls && reviewCalls.length > 0) {
                            for (const rCall of reviewCalls) {
                                if (rCall.name === "approve_asset") {
                                    const rArgs = rCall.args as any;
                                    const pendingToApprove = await PendingAsset.findById(rArgs.asset_id);
                                    if (pendingToApprove) {
                                        await AgentInsight.create({
                                            businessId: pendingToApprove.businessId,
                                            agentName: pendingToApprove.agentName,
                                            type: pendingToApprove.type,
                                            title: pendingToApprove.title,
                                            content: pendingToApprove.content,
                                            status: "approved"
                                        });
                                        await PendingAsset.findByIdAndDelete(rArgs.asset_id);
                                        reviewText += `\n\n✅ התוצר נבדק ואושר על ידי גולדה. פתוח כעת בדשבורד!`;
                                    }
                                }
                            }
                        }
                        
                        aiResponseText = cleanAIResponse(reviewText);
                    } else {
                        aiResponseText += `\n\n❌ ${args.target_agent === "michal" ? "מיכל" : "רועי"} לא הצליח להגיש את התוצר.`;
                    }
                }
            }
        }

        // Add AI response to DB
        chat.messages.push({
            role: "model",
            parts: [{ text: aiResponseText }],
            timestamp: new Date()
        });

        await chat.save();
        return JSON.parse(JSON.stringify(chat.messages));
    } catch (error) {
        console.error("Failed to send internal message via Gemini:", error);
        throw error;
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
