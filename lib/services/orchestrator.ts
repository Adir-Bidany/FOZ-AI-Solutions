import { connectToDatabase } from "@/lib/db";
import ChatExternal from "@/models/ChatExternal";
import Business from "@/models/Business";
import ActionCard from "@/models/ActionCard";
import MasterChatLog from "@/models/MasterChatLog";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateAgentResponse(agentName: string, systemPrompt: string, context: string, tools?: any[]): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelOptions: any = { model: "gemini-2.5-flash" };
    if (tools) modelOptions.tools = tools;

    const model = genAI.getGenerativeModel(modelOptions);
    
    const chatHistory = [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood." }] }
    ];

    const chatSession = model.startChat({ history: chatHistory });
    const result = await chatSession.sendMessage(context);
    
    if (tools && result.response.functionCalls()?.length) {
        return result.response.functionCalls()![0];
    }
    
    return result.response.text();
}

export async function processSessionSummary(sessionId: string) {
    await connectToDatabase();
    console.log(`[Orchestrator] Processing session: ${sessionId}`);

    const conversation = await ChatExternal.findById(sessionId).populate("business_id").lean();
    if (!conversation) throw new Error("Conversation not found");

    const business = await Business.findById(conversation.business_id).lean();
    if (!business) throw new Error("Business not found");

    const transcript = conversation.messages.map((m: any) => `${m.role}: ${m.parts[0].text}`).join("\n");

    // 1. Save to MasterChatLog
    await MasterChatLog.create({
        businessId: business._id,
        sessionId: sessionId,
        transcript: transcript
    });

    // 2. Golda's Triage
    const triageTool = {
        function_declarations: [{
            name: "triage_conversation",
            description: "Evaluates if the conversation contains urgent matters requiring immediate owner attention.",
            parameters: {
                type: "OBJECT",
                properties: {
                    urgent: { type: "BOOLEAN", description: "True if critical or urgent." },
                    summary: { type: "STRING", description: "Brief summary of the issue if urgent." }
                },
                required: ["urgent", "summary"]
            }
        }]
    };

    const goldaContext = `Review this transcript and use the triage_conversation tool: \n${transcript}`;
    const triageResult = await generateAgentResponse("Golda", AGENT_REGISTRY.golda.systemPrompt(business), goldaContext, [triageTool]);

    // 3. Routing based on Triage
    const isUrgent = triageResult?.args?.urgent;

    if (isUrgent) {
        // High-Priority Alert
        await ActionCard.create({
            business_id: business._id,
            source_agent: "management",
            status: "pending",
            priority: "high",
            display_content: {
                title: "Urgent Customer Escalation",
                description: triageResult.args.summary,
                icon: "AlertOctagon"
            }
        });
        console.log(`[Orchestrator] Urgent ActionCard created for session: ${sessionId}`);
        return; // Stop here, no distribution
    }

    // 4. Non-urgent session — Golda now handles marketing & analytics directly.
    // Specialist distribution to MichalDataStore / RoiDataStore has been deprecated.
    console.log(`[Orchestrator] Non-urgent. Orchestration complete for session: ${sessionId}`);
}
