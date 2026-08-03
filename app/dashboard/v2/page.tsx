import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { fetchActionCards } from "@/actions/dashboard";
import DashboardV2Shell from "@/components/dashboard/v2/DashboardV2Shell";

export const metadata = {
    title: "לוח בקרה V2 | FOZ AI Solutions",
    description: "לוח בקרה מתקדם — גרסה 2",
};

export default async function DashboardV2Page() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    await connectDB();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();

    if (!business) {
        redirect("/onboarding");
    }

    // Safely serialize BSON for client boundary
    const serialized = JSON.parse(JSON.stringify(business));

    // Smart name logic — matches existing dashboard/layout.tsx pattern
    let ownerName = serialized.ownerName || "יקירה";
    if (["בעלת", "בעלת העסק", "Owner"].includes(ownerName.trim())) {
        ownerName = "יקירה";
    }
    const firstName = ownerName.split(" ")[0];

    // Fix business name if it duplicates owner name
    let displayBusinessName = serialized.businessName || "העסק שלי";
    if (displayBusinessName.trim() === serialized.ownerName?.trim()) {
        displayBusinessName = `העסק של ${firstName}`;
    }

    // Fetch real action cards for Section 1 — Agent Action Center
    const actionCards = await fetchActionCards(serialized._id.toString());

    return (
        <DashboardV2Shell
            businessId={serialized._id.toString()}
            firstName={firstName}
            businessName={displayBusinessName}
            initialCards={actionCards}
        />
    );
}
