import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Sidebar from "@/components/dashboard/Sidebar";
import BrandingAnchor from "@/components/BrandingAnchor";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    await connectDB();
    const client = await Business.findOne({
        ownerEmail: session.user.email,
    }).lean();

    if (!client) {
        redirect("/onboarding");
    }

    // Safely serialize BSON ObjectIds and Dates for Client Component boundary handoff
    const serializedClient = JSON.parse(JSON.stringify(client));

    // --- SMART DATA LOGIC FOR SIDEBAR ---
    let safeOwnerName = serializedClient.ownerName || "יקירה";
    if (["בעלת", "בעלת העסק", "Owner"].includes(safeOwnerName.trim())) {
        safeOwnerName = "יקירה";
    }
    const firstName = safeOwnerName.split(" ")[0];

    // Fix Business Name if it duplicates the owner name
    let displayBusinessName = serializedClient.businessName || "העסק שלי";
    if (displayBusinessName.trim() === serializedClient.ownerName.trim()) {
        displayBusinessName = `העסק של ${firstName}`;
    }

    // Apply override
    serializedClient.businessName = displayBusinessName;
    serializedClient.ownerName = firstName; // Also helpful for UI consistency
    // --- END LOGIC ---

    return (
        <div className="flex h-screen bg-[#0B0E14] text-white w-full" dir="rtl">
            <main className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex-1 w-full relative">{children}</div>
            </main>

            <BrandingAnchor context="dashboard" businessData={serializedClient}>
                <Sidebar client={serializedClient} />
            </BrandingAnchor>
        </div>
    );
}
