import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { companyLogin, apiKey, userLogin, userPassword } = await req.json();

        await connectToDatabase();

        const business = await Business.findOne({
            ownerEmail: session.user.email,
        });

        if (!business) {
            return NextResponse.json(
                { success: false, error: "Business not found" },
                { status: 404 }
            );
        }

        // Update SimplyBook keys
        if (!business.api_keys) {
            business.api_keys = {};
        }

        business.api_keys.simplybook = {
            companyLogin: companyLogin,
            apiKey: apiKey,
            userLogin: userLogin,
            userPassword: userPassword
        };

        await business.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating settings:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const business = await Business.findOne({
            ownerEmail: session.user.email,
        });

        if (!business) {
            return NextResponse.json(
                { success: false, error: "Business not found" },
                { status: 404 }
            );
        }

        if (business.api_keys && business.api_keys.simplybook) {
            business.api_keys.simplybook = undefined;
            await business.save();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error disconnecting settings:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
