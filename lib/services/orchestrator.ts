import { connectToDatabase } from "@/lib/db";
import ChatExternal from "@/models/ChatExternal";
import Business from "@/models/Business";
import ActionCard from "@/models/ActionCard";
import MasterChatLog from "@/models/MasterChatLog";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { createGeminiInstance } from "@/lib/utils/ai-helpers";

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

async function generateAgentResponse(agentName: string, systemPrompt: string, context: string, tools?: any[], retries = 3): Promise<any> {
    const model = createGeminiInstance({
        modelName: "gemini-2.5-flash",
        systemInstruction: systemPrompt,
        tools: tools,
    });
    
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(context);
            
            if (tools && result.response.functionCalls()?.length) {
                const call = result.response.functionCalls()![0];
                if (!call || !call.args) throw new Error("Invalid tool call output from model");
                return call;
            }
            
            const text = result.response.text();
            if (!text) throw new Error("Empty text response from model");
            return text;
        } catch (error: any) {
            const isLast = i === retries - 1;
            if (isLast) throw error;
            console.warn(`[Orchestrator] generateAgentResponse attempt ${i + 1} failed, retrying in ${Math.pow(2, i)}s...`, error?.message || error);
            await wait(1000 * Math.pow(2, i));
        }
    }
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
        business_id: business._id,
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
    console.log(`[Orchestrator] Non-urgent. Orchestration complete for session: ${sessionId}`);
}
