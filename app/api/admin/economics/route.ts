import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import ChatExternal from "@/models/ChatExternal";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";

// Gemini 2.5 Flash Pricing Constants
const COST_PER_1M_INPUT_USD = 0.075;
const COST_PER_1M_OUTPUT_USD = 0.30;
const USD_TO_ILS = 3.65;

export async function GET(req: NextRequest) {
    // Admin RBAC verification
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const adminCookie = req.cookies.get("admin_access")?.value;
    if (!adminCookie && (!token || token.role !== "admin")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();

        // 1. Fetch all registered businesses
        const businesses = await Business.find({}).lean();
        const businessMap: Record<string, any> = {};
        businesses.forEach((b: any) => {
            businessMap[b._id.toString()] = {
                id: b._id.toString(),
                businessName: b.businessName || "עסק ללא שם",
                ownerName: b.ownerName || "בעלים",
                email: b.ownerEmail || b.email || "",
                slug: b.slug || "",
            };
        });

        // 2. Aggregate token usage per business from ChatExternal
        const aggregatedUsage = await ChatExternal.aggregate([
            {
                $group: {
                    _id: "$business_id",
                    totalChats: { $sum: 1 },
                    promptTokens: { $sum: { $ifNull: ["$usage.prompt_tokens", 0] } },
                    completionTokens: { $sum: { $ifNull: ["$usage.completion_tokens", 0] } },
                    totalTokens: { $sum: { $ifNull: ["$usage.total_tokens", 0] } },
                },
            },
        ]);

        let overallPromptTokens = 0;
        let overallCompletionTokens = 0;
        let overallTotalTokens = 0;
        let overallChats = 0;

        const tenantBreakdown = aggregatedUsage.map((item: any) => {
            const bId = item._id ? item._id.toString() : "unknown";
            const bInfo = businessMap[bId] || {
                id: bId,
                businessName: bId === "000000000000000000000000" ? "פז (עמוד הבית FOZ)" : "עסק לא פעיל / נמחק",
                ownerName: "מערכת",
                email: "-",
                slug: "-",
            };

            const prompt = item.promptTokens || 0;
            const completion = item.completionTokens || 0;
            const total = item.totalTokens || (prompt + completion);
            const chats = item.totalChats || 0;

            overallPromptTokens += prompt;
            overallCompletionTokens += completion;
            overallTotalTokens += total;
            overallChats += chats;

            const costUSD = (prompt / 1_000_000) * COST_PER_1M_INPUT_USD + (completion / 1_000_000) * COST_PER_1M_OUTPUT_USD;
            const costILS = costUSD * USD_TO_ILS;

            return {
                ...bInfo,
                totalChats: chats,
                promptTokens: prompt,
                completionTokens: completion,
                totalTokens: total,
                costUSD: Number(costUSD.toFixed(5)),
                costILS: Number(costILS.toFixed(3)),
            };
        });

        // Sort breakdown by total tokens descending
        tenantBreakdown.sort((a, b) => b.totalTokens - a.totalTokens);

        // Compute top noisy neighbors (top 5 token consumers)
        const noisyNeighbors = tenantBreakdown.slice(0, 5);

        // Overall Costs
        const totalCostUSD = (overallPromptTokens / 1_000_000) * COST_PER_1M_INPUT_USD + (overallCompletionTokens / 1_000_000) * COST_PER_1M_OUTPUT_USD;
        const totalCostILS = totalCostUSD * USD_TO_ILS;

        return NextResponse.json({
            success: true,
            metrics: {
                totalBusinesses: businesses.length,
                activeTokenBusinesses: tenantBreakdown.filter((t) => t.totalTokens > 0).length,
                overallChats,
                overallPromptTokens,
                overallCompletionTokens,
                overallTotalTokens,
                totalCostUSD: Number(totalCostUSD.toFixed(4)),
                totalCostILS: Number(totalCostILS.toFixed(2)),
                avgTokensPerChat: overallChats > 0 ? Math.round(overallTotalTokens / overallChats) : 0,
            },
            noisyNeighbors,
            tenantBreakdown,
        });
    } catch (error: any) {
        console.error("AI Economics API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch economics metrics" }, { status: 500 });
    }
}
