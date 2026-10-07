import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import MasterChatLog from "@/models/MasterChatLog";
import ActionCard from "@/models/ActionCard";
import ChatExternal from "@/models/ChatExternal";
import { AGENT_REGISTRY } from "@/lib/agents/registry";
import { createGeminiInstance } from "@/lib/utils/ai-helpers";
import { processSessionSummary } from "@/lib/services/orchestrator";

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
            console.warn(`[Executive Loop] generateAgentResponse attempt ${i + 1} failed, retrying in ${Math.pow(2, i)}s...`, error?.message || error);
            await wait(1000 * Math.pow(2, i));
        }
    }
}

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const businesses = await Business.find({}).lean();

        const summaryTool = {
            function_declarations: [{
                name: "generate_executive_summary",
                description: "Generates an end-of-day executive summary action card.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        summary: { type: "STRING" }
                    },
                    required: ["summary"]
                }
            }]
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const business of businesses) {
            try {
                // 1. Process all pending chat sessions for this business
                const pendingChats = await ChatExternal.find({
                    business_id: business._id,
                    processed_for_insights: false
                }).lean();

                for (const chat of pendingChats) {
                    try {
                        await processSessionSummary(chat._id.toString());
                        await ChatExternal.findByIdAndUpdate(chat._id, { processed_for_insights: true });
                    } catch (sessionErr) {
                        console.error(`[Executive Loop] Failed to process session ${chat._id}:`, sessionErr);
                    }
                }

                // 2. Fetch today's logs for the executive summary
                const logs = await MasterChatLog.find({
                    business_id: business._id,
                    createdAt: { $gte: today }
                }).lean();

                if (logs.length > 0) {
                    const data = logs.map(l => l.transcript).join("\n\n---\n\n");
                    const prompt = `Analyze today's master logs and generate one executive conclusion using generate_executive_summary: \n${data}`;
                    
                    const res = await generateAgentResponse("Golda", AGENT_REGISTRY.golda.systemPrompt(business), prompt, [summaryTool]);
                    
                    if (res?.args) {
                        await ActionCard.create({
                            business_id: business._id,
                            source_agent: "management",
                            status: "pending",
                            priority: "medium",
                            display_content: {
                                title: "Daily Executive Summary",
                                description: res.args.summary,
                                icon: "BarChart"
                            }
                        });
                    }
                }
            } catch (err: any) {
                console.error(`[Executive Loop] Failed for business ${business._id}:`, err?.message || err);
                continue; // Prevent a single error from halting the loop for other businesses
            }
        }

        return NextResponse.json({ success: true, message: "Executive loop completed" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
