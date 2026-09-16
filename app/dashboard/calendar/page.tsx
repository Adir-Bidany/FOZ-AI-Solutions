import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Business from "@/models/Business";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";
import WeeklyCalendar from "@/components/dashboard/WeeklyCalendar";
import CalendarControlBar from "@/components/dashboard/calendar/CalendarControlBar";
import { format, addDays, startOfWeek } from "date-fns";
import FeatureGate from "@/components/dashboard/FeatureGate";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const effectiveTier = session.user.effectiveTier ?? "basic";

    await connectToDatabase();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();

    const isDemo = business?.slug === "demo";
    const workingHours = (business as any)?.workingHours ?? undefined;

    const resolvedSearchParams = await searchParams;
    const dateParam = resolvedSearchParams?.date;
    const currentDate = dateParam ? new Date(dateParam) : new Date();
    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });

    let liveEvents: any[] = [];

    if (isDemo) {
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
                {/* Page Header */}
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">יומן תורים</h1>
                    <p className="text-gray-500 mt-1">ניהול תורים מקומי</p>
                </div>

                {/* Control Bar */}
                <CalendarControlBar workingHours={workingHours} />

                {/* Calendar Grid */}
                <WeeklyCalendar events={liveEvents} />
            </div>
        </FeatureGate>
    );
}
