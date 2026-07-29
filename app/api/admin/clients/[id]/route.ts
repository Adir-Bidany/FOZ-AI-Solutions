import { NextResponse } from "next/server";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { getToken } from "next-auth/jwt";

export async function DELETE(
    request: Request,
    // בגרסאות חדשות של Next.js 15, ה-params מגיע כ-Promise שצריך להמתין לו
    { params }: { params: Promise<{ id: string }> }
) {
    // Admin RBAC: Only authenticated admins or valid quick-access cookie may delete clients
    const token = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
    const cookiesHeader = request.headers.get("cookie") || "";
    const hasAdminCookie = cookiesHeader.includes("admin_access=true");
    if (!hasAdminCookie && (!token || token.role !== "admin")) {
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
