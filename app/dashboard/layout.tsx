import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

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
    const client = await Business.findOne({ ownerEmail: session.user.email }).lean();

    if (!client) {
        redirect("/onboarding");
    }

    // Serialize client data
    const serializedClient = JSON.parse(JSON.stringify(client));

    // --- SMART DATA LOGIC FOR SIDEBAR ---
    let safeOwnerName = serializedClient.ownerName || "יקירה";
    if (["בעלת", "בעלת העסק", "Owner"].includes(safeOwnerName.trim())) {
        safeOwnerName = "יקירה";
    }
    const firstName = safeOwnerName.split(" ")[0];

    // Fix Business Name if it duplicates the owner name
    let displayBusinessName = serializedClient.businessName || "הקליניקה שלי";
    if (displayBusinessName.trim() === serializedClient.ownerName.trim()) {
        displayBusinessName = `הקליניקה של ${firstName}`;
    }

    // Apply override
    serializedClient.businessName = displayBusinessName;
    serializedClient.ownerName = firstName; // Also helpful for UI consistency
    // --- END LOGIC ---

    return (
        <div className="flex h-screen bg-gray-50" dir="rtl">
            <aside className="hidden lg:block w-80 h-full border-l border-gray-200 bg-white shrink-0">
                <Sidebar client={serializedClient} />
            </aside>
            <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="font-bold text-lg text-gray-800">
                        {serializedClient.businessName}
                    </div>
                    <MobileSidebar client={serializedClient} />
                </div>

                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
