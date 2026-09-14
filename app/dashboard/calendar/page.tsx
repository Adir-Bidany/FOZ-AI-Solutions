import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Business from "@/models/Business";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";
import WeeklyCalendar from "@/components/dashboard/WeeklyCalendar";
import CalendarHeaderActions from "@/components/dashboard/CalendarHeaderActions";
import { getBookings } from "@/lib/simplybook";
import { format, addDays, startOfWeek } from "date-fns";
import FeatureGate from "@/components/dashboard/FeatureGate";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const effectiveTier = session.user.effectiveTier ?? "basic";

    await connectToDatabase();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();

    // Fix: Proper schema lookup
    const sbCreds = business?.api_keys?.simplybook;
    const isDemo = business?.slug === "demo";

    const resolvedSearchParams = await searchParams;
    const dateParam = resolvedSearchParams?.date;
    const currentDate = dateParam ? new Date(dateParam) : new Date();
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    const fromDateStr = format(startDate, "yyyy-MM-dd");
    const toDateStr = format(addDays(startDate, 6), "yyyy-MM-dd");

    let liveEvents = null;
    let hasError = false;

    if (sbCreds?.companyLogin && sbCreds?.userLogin && sbCreds?.userPassword) {
        liveEvents = await getBookings(sbCreds as any, fromDateStr, toDateStr);
        if (liveEvents === null) hasError = true;
        console.log("SimplyBook Raw Bookings:", liveEvents);
    } else if (isDemo) {
        // Mock events for demo pitch
        liveEvents = Array.from({ length: 12 }).map((_, i) => ({
            id: `mock-${i}`,
            title: ["דנה ישראלי", "יוסי לוי", "מיכל כהן", "אבי אברהם", "שירה גולן", "רון כץ", "טלי רון", "גיל שחר", "עדי כהן", "רונן דוד", "נועה יוסף", "דניאל מור"][i],
            date: format(addDays(startDate, Math.floor(Math.random() * 7)), "yyyy-MM-dd"),
            startTime: `${9 + (i % 8)}:00:00`,
            endTime: `${10 + (i % 8)}:00:00`,
            service: ["ייעוץ עסקי", "פגישת הכרות", "אימון אישי", "טיפול פנים", "עיסוי", "תספורת"][i % 6],
            phone: "050-0000000"
        }));
    }

    return (
        <FeatureGate currentTier={effectiveTier} requiredFeature="CALENDAR_SYNC">
            <div className="h-full flex flex-col p-6 w-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">יומן תורים</h1>
                        <p className="text-gray-500 mt-1">
                            {sbCreds?.companyLogin ? `מחובר לחשבון: ${sbCreds.companyLogin}` : "לא מחובר ליומן"}
                        </p>
                    </div>
                    {sbCreds?.companyLogin && (
                        <CalendarHeaderActions />
                    )}
                </div>

                <WeeklyCalendar events={liveEvents} hasError={hasError} />
            </div>
        </FeatureGate>
    );
}
