import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import MasterChatLog from "@/models/MasterChatLog";
import ActionCard from "@/models/ActionCard";
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

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== process.env.CRON_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const businesses = await Business.find({});

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
            const logs = await MasterChatLog.find({
                businessId: business._id,
                createdAt: { $gte: today }
            });

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
        }

        return NextResponse.json({ success: true, message: "Executive loop completed" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
