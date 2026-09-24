import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";
import Customer from "@/models/Customer";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_foz_ai";

export async function POST(req: Request) {
    try {
        const subscription = await req.json();
        
        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ success: false, error: "Invalid subscription object" }, { status: 400 });
        }

        await connectToDatabase();

        // Check if Business Owner (NextAuth)
        const session = await getServerSession(authOptions);
        if (session && session.user?.email) {
            const business = await Business.findOne({ ownerEmail: session.user.email });
            if (business) {
                // Ensure array exists
                if (!business.pushSubscriptions) business.pushSubscriptions = [];
                
                // Add if not already exists (by endpoint)
                const exists = business.pushSubscriptions.some((s: any) => s.endpoint === subscription.endpoint);
                if (!exists) {
                    business.pushSubscriptions.push(subscription);
                    await business.save();
                }
                return NextResponse.json({ success: true, userType: "business" });
            }
        }

        // Check if Consumer (consumer_token cookie)
        const cookieStore = await cookies();
        const token = cookieStore.get("consumer_token")?.value;
        
        if (token) {
            try {
                const decoded: any = jwt.verify(token, JWT_SECRET);
                const customer = await Customer.findById(decoded.customerId);
                
                if (customer) {
                    if (!customer.pushSubscriptions) customer.pushSubscriptions = [];
                    
                    const exists = customer.pushSubscriptions.some((s: any) => s.endpoint === subscription.endpoint);
                    if (!exists) {
                        customer.pushSubscriptions.push(subscription);
                        await customer.save();
                    }
                    return NextResponse.json({ success: true, userType: "customer" });
                }
            } catch (e) {
                // Ignore invalid token
            }
        }

        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    } catch (error) {
        console.error("Subscription Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
