import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Customer from "@/models/Customer";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { businessId, name, lastName, email, phone, password } = await req.json();

        if (!businessId || !name || !lastName || !email || !phone || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        // Check if customer already exists for this business
        const existingCustomer = await Customer.findOne({ business_id: businessId, phone });
        if (existingCustomer) {
            return NextResponse.json({ error: "Customer already registered with this phone number" }, { status: 409 });
        }

        const existingCustomerEmail = await Customer.findOne({ business_id: businessId, email });
        if (existingCustomerEmail) {
            return NextResponse.json({ error: "Customer already registered with this email" }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            business_id: businessId,
            name,
            lastName,
            email,
            phone,
            passwordHash,
            status: "pending",
            metrics: {
                totalRevenue: 0,
                totalAppointments: 0
            },
            history: {
                lastTreatments: []
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Registered successfully. Awaiting approval.",
            customerId: customer._id 
        });

    } catch (error: any) {
        console.error("Consumer Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
