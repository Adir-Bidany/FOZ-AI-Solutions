import { NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { isAdminRequest } from "@/lib/admin-auth";

export async function DELETE(
    request: Request,
    // בגרסאות חדשות של Next.js 15, ה-params מגיע כ-Promise שצריך להמתין לו
    { params }: { params: Promise<{ id: string }> }
) {
    // Admin RBAC: signed NextAuth JWT with role=admin only
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. חיבור לדאטה בייס
        await connectDB();

        // 2. שליפת המזהה (המתנה ל-Promise)
        const { id } = await params;

        // 3. מחיקת הלקוח
        const deletedClient = await Business.findByIdAndDelete(id);

        // 4. אם לא נמצא לקוח כזה
        if (!deletedClient) {
            return NextResponse.json(
                { success: false, error: "Client not found" },
                { status: 404 }
            );
        }

        // 5. הצלחה
        return NextResponse.json({
            success: true,
            message: "Client deleted successfully",
        });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete client" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // Admin RBAC: signed NextAuth JWT with role=admin only
    if (!(await isAdminRequest(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const updateFields: Record<string, any> = {};

        if (body.businessName !== undefined) updateFields.businessName = body.businessName.trim();
        if (body.slug !== undefined) updateFields.slug = body.slug.trim().toLowerCase();
        if (body.ownerName !== undefined) updateFields.ownerName = body.ownerName.trim();
        if (body.ownerEmail !== undefined) {
            updateFields.ownerEmail = body.ownerEmail.trim();
            updateFields.email = body.ownerEmail.trim();
        }
        if (body.account_status !== undefined) {
            updateFields.account_status = body.account_status;
            // Keep subscriptionStatus synchronized if active or trial
            if (["active", "trial"].includes(body.account_status)) {
                updateFields.subscriptionStatus = body.account_status;
            } else if (body.account_status === "suspended") {
                updateFields.subscriptionStatus = "expired";
            }
        }
        if (body.subscription_tier !== undefined) {
            updateFields.subscription_tier = body.subscription_tier;
        }
        if (body.ai_token_quota !== undefined) {
            updateFields.ai_token_quota = body.ai_token_quota;
        }

        const updatedClient = await Business.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedClient) {
            return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Client updated successfully",
            client: updatedClient,
        });
    } catch (error: any) {
        console.error("Update client error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to update client" },
            { status: 500 }
        );
    }
}
