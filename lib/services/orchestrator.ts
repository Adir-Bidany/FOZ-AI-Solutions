import { connectToDatabase } from "@/lib/db";
import ChatExternal, { IMessage } from "@/models/ChatExternal";
import Business from "@/models/Business";
import ActionCard from "@/models/ActionCard";
import { AGENT_PROMPTS } from "@/lib/agents/prompts";

// Placeholder for LLM interaction
async function generateAgentResponse(agentName: string, systemPrompt: string, context: string): Promise<string> {
    console.log(`[Orchestrator] ${agentName} is thinking...`);
    console.log(`[Orchestrator] Context: ${context.substring(0, 50)}...`);

    // In a real implementation, this would call Gemini/OpenAI
    // For now, we return a simulated response based on the agent
    if (agentName === "Michal") {
        return "Based on the conversation, the customer seems interested in anti-aging. We should suggest our new retinol treatment.";
    }
    if (agentName === "Roi") {
        return "Customer LTV is high. Approving a 10% discount is financially viable to ensure retention.";
    }
    if (agentName === "Golda") {
        return "Approved. I will create an action item to send a WhatsApp message with the offer.";
    }

    return "No comment.";
}

export async function processSessionSummary(sessionId: string) {
    await connectToDatabase();

    console.log(`[Orchestrator] Processing session: ${sessionId}`);

    // 1. Fetch Context
    const conversation = await ChatExternal.findById(sessionId).populate("business_id");
    if (!conversation) {
        throw new Error("Conversation not found");
    }

    const business = await Business.findById(conversation.business_id);
    if (!business) {
        throw new Error("Business not found");
    }

    // 2. Generate Summary (Mocked for now)
    const sessionSummary = conversation.messages.map((m: any) => `${m.role}: ${m.parts[0].text}`).join("\n");

    // 3. Consult Specialists
    const michalContext = `Analyze this conversation for marketing opportunities:\n${sessionSummary}`;
    const michalAdvice = await generateAgentResponse(
        "Michal",
        AGENT_PROMPTS.michal(business),
        michalContext
    );

    const roiContext = `Analyze this conversation for financial risks/opportunities:\n${sessionSummary}`;
    const roiAdvice = await generateAgentResponse(
        "Roi",
        AGENT_PROMPTS.roi(business),
        roiContext
    );

    // 4. Golda Decides
    const goldaContext = `
    Session Summary: ${sessionSummary}
    Michal's Advice: ${michalAdvice}
    Roi's Advice: ${roiAdvice}
    
    Decide on the next operational step.
    `;

    const goldaDecision = await generateAgentResponse(
        "Golda",
        AGENT_PROMPTS.golda(business),
        goldaContext
    );

    // 5. Create ActionCard (Golda's Action)
    // In a real app, Golda's output would be structured JSON. Here we simulate it.
    const newAction = await ActionCard.create({
        business_id: business._id,
        source_agent: "management", // Golda
        status: "pending",
        priority: "medium",
        display_content: {
            title: "Follow-up Opportunity",
            description: `Michal suggests: ${michalAdvice}. Golda decided: ${goldaDecision}`,
            icon: "Sparkles"
        },
        execution_payload: {
            action_type: "send_message",
            params: {
                phone: "0500000000", // Would be extracted from customer context
                message: "Hi! We have a special offer for you based on our last chat."
            }
        }
    });

    console.log(`[Orchestrator] ActionCard created: ${newAction._id}`);
    return newAction;
}
