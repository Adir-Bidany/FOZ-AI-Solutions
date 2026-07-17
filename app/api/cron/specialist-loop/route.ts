import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import MichalDataStore from "@/models/MichalDataStore";
import RoiDataStore from "@/models/RoiDataStore";
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

        for (const business of businesses) {
            // Michal's Loop
            const unprocMichal = await MichalDataStore.find({ businessId: business._id, processed: false });
            if (unprocMichal.length > 0) {
                const data = unprocMichal.map(d => d.extractedContext).join("\n");
                const prompt = `Synthesize this raw data into ONE master marketing tip and use submit_for_approval: \n${data}`;
                const res = await generateAgentResponse("Michal", AGENT_REGISTRY.michal.systemPrompt(business), prompt, [submitTool]);
                
                if (res?.args) {
                    await PendingAsset.create({
                        businessId: business._id,
                        agentName: "Michal",
                        type: res.args.type,
                        title: res.args.title,
                        content: res.args.content,
                        status: "pending"
                    });
                    await MichalDataStore.updateMany({ _id: { $in: unprocMichal.map(d => d._id) } }, { processed: true });
                }
            }

            // Roi's Loop
            const unprocRoi = await RoiDataStore.find({ businessId: business._id, processed: false });
            if (unprocRoi.length > 0) {
                const data = unprocRoi.map(d => d.extractedContext).join("\n");
                const prompt = `Synthesize this raw data into ONE master financial insight and use submit_for_approval: \n${data}`;
                const res = await generateAgentResponse("Roi", AGENT_REGISTRY.roi.systemPrompt(business), prompt, [submitTool]);
                
                if (res?.args) {
                    await PendingAsset.create({
                        businessId: business._id,
                        agentName: "Roi",
                        type: res.args.type,
                        title: res.args.title,
                        content: res.args.content,
                        status: "pending"
                    });
                    await RoiDataStore.updateMany({ _id: { $in: unprocRoi.map(d => d._id) } }, { processed: true });
                }
            }
        }

        return NextResponse.json({ success: true, message: "Specialist loop completed" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Internal Error" }, { status: 500 });
    }
}
