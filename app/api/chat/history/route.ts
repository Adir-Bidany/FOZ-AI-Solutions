import { NextRequest, NextResponse } from "next/server";
import { getAuthSecret } from "@/lib/auth-secret";
import { connectToDatabase } from "@/lib/db";
import ChatExternal from "@/models/ChatExternal";
import Customer from "@/models/Customer";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

const HISTORY_MESSAGE_LIMIT = 40; // Return last 20 message pairs (40 entries)

export async function GET(req: NextRequest) {
    try {
        // 1. Verify consumer token from cookie
        const consumerToken = req.cookies.get("consumer_token")?.value;

        if (!consumerToken) {
            return NextResponse.json({ success: false, messages: [], sessionId: null }, { status: 200 });
        }

        let customerId: string;
        let tokenBusinessId: string;

        try {
            const decoded = jwt.verify(consumerToken, getAuthSecret()) as any;
            customerId = decoded.customerId;
            tokenBusinessId = decoded.businessId;
        } catch {
            return NextResponse.json({ success: false, messages: [], sessionId: null }, { status: 200 });
        }

        if (!customerId || !Types.ObjectId.isValid(customerId)) {
            return NextResponse.json({ success: false, messages: [], sessionId: null }, { status: 200 });
        }

        // 2. Ensure customer exists and belongs to the correct business
        await connectToDatabase();
        const customer = await Customer.findById(customerId).lean();

        if (!customer) {
            return NextResponse.json({ success: false, messages: [], sessionId: null }, { status: 200 });
        }

        // Strict tenancy check: token businessId must match the customer business_id
        if (customer.business_id.toString() !== tokenBusinessId) {
            console.warn(`[Chat History] Tenancy mismatch: token=${tokenBusinessId}, customer.business_id=${customer.business_id}`);
            return NextResponse.json({ success: false, messages: [], sessionId: null }, { status: 200 });
        }

        // 3. Find the most recent ChatExternal session for this customer
        const latestSession = await ChatExternal.findOne({
            customer_id: new Types.ObjectId(customerId),
            business_id: customer.business_id,
        })
            .sort({ updatedAt: -1 })
            .lean();

        if (!latestSession || latestSession.messages.length === 0) {
            return NextResponse.json({ success: true, messages: [], sessionId: null }, { status: 200 });
        }

        // 4. Return the last N messages (sliding window for UI)
        const messages = latestSession.messages
            .slice(-HISTORY_MESSAGE_LIMIT)
            .map((m: any) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.parts?.[0]?.text || "",
                timestamp: m.timestamp,
            }));

        return NextResponse.json({
            success: true,
            messages,
            sessionId: latestSession._id.toString(),
        });

    } catch (error: any) {
        console.error("[Chat History API] Error:", error);
        return NextResponse.json({ success: false, messages: [], sessionId: null }, { status: 500 });
    }
}