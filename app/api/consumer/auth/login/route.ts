import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_foz_ai";

export async function POST(req: NextRequest) {
    try {
        const { businessId, email, password } = await req.json();

        if (!businessId || !email || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const customer = await Customer.findOne({ business_id: businessId, email });
        if (!customer) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Strict Status Check for Pending Users
        if (customer.status === "pending") {
            return NextResponse.json(
                { error: "Your registration is pending approval from the business owner." }, 
                { status: 403 }
            );
        }

        const isMatch = await bcrypt.compare(password, customer.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Generate lightweight JWT for the Consumer Scope
        const payload = {
            customerId: customer._id.toString(),
            name: customer.name,
            lastName: customer.lastName,
            email: customer.email,
            businessId: customer.business_id.toString(),
            role: "consumer"
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

        const response = NextResponse.json({
            success: true,
            token,
            customer: {
                id: customer._id,
                name: customer.name,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                metrics: customer.metrics,
                history: customer.history
            }
        });

        // Set Cookie distinct from NextAuth
        response.cookies.set("consumer_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    } catch (error: any) {
        console.error("Consumer Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
