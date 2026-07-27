import { Card, CardContent } from "@/components/ui/card";
import { notFound, redirect } from "next/navigation";
import { connectToDatabase as connectDB } from "@/lib/db";
import Business from "@/models/Business";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ActionCardGrid from "@/components/dashboard/ActionCardGrid";
import { fetchActionCards } from "@/actions/dashboard";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import AgentRoom from "@/components/dashboard/AgentRoom";

import ActionsDialog from "@/components/dashboard/ActionsDialog";

export default async function ClientDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    await connectDB();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();

    if (!business) {
        return notFound();
    }

    // Fetch Action Cards (Zone A)
    const actionCards = await fetchActionCards(business._id.toString());

    // Calculate pending actions count
    const pendingCount = actionCards.filter((c: any) => c.status === 'pending').length;

    return (
        <div className="p-4 lg:p-8 w-full font-sans">
            {/* ZONE A: Action Center */}
            <div className="mb-8">
                <ActionCardGrid cards={actionCards} />
            </div>

            {/* סטטיסטיקות */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
                {/* 1. Clickable Actions for Today Dialog Card */}
                <ActionsDialog pendingCards={actionCards} pendingCount={pendingCount} />

                {/* 2. Revenue Card */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-2xl overflow-hidden group">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                הכנסות החודש
                            </p>
                            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                                ₪0
                            </h3>
                        </div>
                        <div className="mt-4">
                            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md inline-block border border-border">
                                התחלה חדשה
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Appointments Card */}
                <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-2xl overflow-hidden group">
                    <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                תורים עתידיים
                            </p>
                            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                                0
                            </h3>
                        </div>
                        <div className="mt-4">
                            <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md inline-block border border-border">
                                מחכה ללידים
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ZONE B: Agent Room */}
            <div className="w-full h-auto xl:h-[650px] flex flex-col space-y-4">
                <AgentRoom businessId={business._id.toString()} />
            </div>

            <AnalyticsSection />
        </div>
    );
}
