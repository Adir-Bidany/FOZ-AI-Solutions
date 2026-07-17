import { connectToDatabase } from "@/lib/db";
import ChatExternal from "@/models/ChatExternal";
import Business from "@/models/Business";
import ActionCard from "@/models/ActionCard";
import MasterChatLog from "@/models/MasterChatLog";
import MichalDataStore from "@/models/MichalDataStore";
import RoiDataStore from "@/models/RoiDataStore";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateAgentResponse(agentName: string, systemPrompt: string, context: string, tools?: any[]): Promise<any> {
    const modelOptions: any = { model: "gemini-2.0-flash" };
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

    const conversation = await ChatExternal.findById(sessionId).populate("business_id");
    if (!conversation) throw new Error("Conversation not found");

    const business = await Business.findById(conversation.business_id);
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

    // 4. Distribution (Silent Extraction)
    console.log(`[Orchestrator] Non-urgent. Distributing to specialists.`);

    // Michal Extraction
    const michalTool = {
        function_declarations: [{
            name: "save_marketing_raw_data",
            description: "Saves raw marketing context from the chat.",
            parameters: {
                type: "OBJECT",
                properties: {
                    extractedContext: { type: "STRING", description: "Marketing signals extracted." }
                },
                required: ["extractedContext"]
            }
        }]
    };
    const michalContext = `Extract marketing signals using save_marketing_raw_data: \n${transcript}`;
    const michalResult = await generateAgentResponse("Michal", AGENT_REGISTRY.michal.systemPrompt(business), michalContext, [michalTool]);

    if (michalResult?.args?.extractedContext) {
        await MichalDataStore.create({
            businessId: business._id,
            sourceSessionId: sessionId,
            extractedContext: michalResult.args.extractedContext
        });
    }

    // Roi Extraction
    const roiTool = {
        function_declarations: [{
            name: "save_financial_raw_data",
            description: "Saves raw financial context from the chat.",
            parameters: {
                type: "OBJECT",
                properties: {
                    extractedContext: { type: "STRING", description: "Financial signals extracted." }
                },
                required: ["extractedContext"]
            }
        }]
    };
    const roiContext = `Extract financial signals using save_financial_raw_data: \n${transcript}`;
    const roiResult = await generateAgentResponse("Roi", AGENT_REGISTRY.roi.systemPrompt(business), roiContext, [roiTool]);

    if (roiResult?.args?.extractedContext) {
        await RoiDataStore.create({
            businessId: business._id,
            sourceSessionId: sessionId,
            extractedContext: roiResult.args.extractedContext
        });
    }

    console.log(`[Orchestrator] Orchestration complete for session: ${sessionId}`);
}
