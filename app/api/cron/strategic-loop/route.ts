import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import MasterChatLog from "@/models/MasterChatLog";
import MichalDataStore from "@/models/MichalDataStore";
import RoiDataStore from "@/models/RoiDataStore";
import ActionCard from "@/models/ActionCard";
import PendingAsset from "@/models/PendingAsset";
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

        const submitTool = {
            function_declarations: [{
                name: "submit_for_approval",
                description: "Submits a generated asset to Golda for approval.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        type: { type: "STRING" },
                        title: { type: "STRING" },
                        content: { type: "STRING" }
                    },
                    required: ["type", "title", "content"]
                }
            }]
        };

        const summaryTool = {
            function_declarations: [{
                name: "generate_executive_summary",
                description: "Generates an end-of-week executive summary action card.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        summary: { type: "STRING" }
                    },
                    required: ["summary"]
                }
            }]
        };

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        for (const business of businesses) {
            // Golda's Weekly Summary (MasterChatLog)
            const logs = await MasterChatLog.find({ businessId: business._id, createdAt: { $gte: weekAgo } });
            if (logs.length > 0) {
                const data = logs.map(l => l.transcript).join("\n\n---\n\n");
                const prompt = `Analyze this week's master logs and generate one strategic executive conclusion using generate_executive_summary: \n${data}`;
                const res = await generateAgentResponse("Golda", AGENT_REGISTRY.golda.systemPrompt(business), prompt, [summaryTool]);
                if (res?.args) {
                    await ActionCard.create({
                        business_id: business._id,
                        source_agent: "management",
                        status: "pending",
                        priority: "high",
                        display_content: {
                            title: "Weekly Strategic Report (Management)",
                            description: res.args.summary,
                            icon: "Target"
                        }
                    });
                }
            }

            // Michal's Weekly Tip (MichalDataStore)
            const mLogs = await MichalDataStore.find({ businessId: business._id, createdAt: { $gte: weekAgo } });
            if (mLogs.length > 0) {
                const data = mLogs.map(l => l.extractedContext).join("\n");
                const prompt = `Synthesize this week's raw marketing data into ONE weekly strategic tip and use submit_for_approval: \n${data}`;
                const res = await generateAgentResponse("Michal", AGENT_REGISTRY.michal.systemPrompt(business), prompt, [submitTool]);
                if (res?.args) {
                    await PendingAsset.create({
                        businessId: business._id,
                        agentName: "Michal",
                        type: res.args.type,
                        title: "Weekly Strategy: " + res.args.title,
                        content: res.args.content,
                        status: "pending"
                    });
                }
            }

            // Roi's Weekly Tip (RoiDataStore)
            const rLogs = await RoiDataStore.find({ businessId: business._id, createdAt: { $gte: weekAgo } });
            if (rLogs.length > 0) {
                const data = rLogs.map(l => l.extractedContext).join("\n");
                const prompt = `Synthesize this week's raw financial data into ONE weekly strategic insight and use submit_for_approval: \n${data}`;
                const res = await generateAgentResponse("Roi", AGENT_REGISTRY.roi.systemPrompt(business), prompt, [submitTool]);
                if (res?.args) {
                    await PendingAsset.create({
                        businessId: business._id,
                        agentName: "Roi",
                        type: res.args.type,
                        title: "Weekly Strategy: " + res.args.title,
                        content: res.args.content,
                        status: "pending"
                    });
                }
            }
        }

        return NextResponse.json({ success: true, message: "Strategic loop completed" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
