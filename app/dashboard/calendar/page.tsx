import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Business from "@/models/Business";
import Appointment from "@/models/Appointment";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";
import WeeklyCalendar from "@/components/dashboard/WeeklyCalendar";
import CalendarContainer from "@/components/dashboard/calendar/CalendarContainer";
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
    const endDate = addDays(startDate, 6);

    let liveEvents: any[] = [];

    if (isDemo) {
        // Mock events for demo pitch
        liveEvents = Array.from({ length: 12 }).map((_, i) => ({
            id: `mock-${i}`,
            type: i % 5 === 0 ? "block" : "booking",
            title: ["דנה ישראלי", "יוסי לוי", "מיכל כהן", "אבי אברהם", "שירה גולן", "רון כץ", "טלי רון", "גיל שחר", "עדי כהן", "רונן דוד", "נועה יוסף", "דניאל מור"][i],
            date: format(addDays(startDate, Math.floor(i * 7 / 12)), "yyyy-MM-dd"),
            startTime: `${9 + (i % 7)}:00:00`,
            endTime: `${10 + (i % 7)}:00:00`,
            service: ["ייעוץ עסקי", "פגישת הכרות", "אימון אישי", "טיפול פנים", "עיסוי", "תספורת"][i % 6],
            phone: "050-0000000",
        }));
    } else if (business) {
        // Fetch real appointments + blocks from MongoDB for the current week
        const rawAppointments = await Appointment.find({
            business_id: (business as any)._id,
            "details.date": {
                $gte: startDate,
                $lte: endDate,
            },
            status: { $nin: ["cancelled"] },
        }).lean();

        liveEvents = rawAppointments.map((appt: any) => {
            const date = new Date(appt.details.date);
            const durationMs = (appt.details.duration_minutes ?? 60) * 60 * 1000;
            const endDateObj = new Date(date.getTime() + durationMs);

            const padTime = (h: number, m: number) =>
                `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`;

            return {
                id: appt._id.toString(),
                type: appt.type ?? "booking",
                title: appt.title ?? appt.details.service_name ?? "תור",
                date: format(date, "yyyy-MM-dd"),
                startTime: padTime(date.getHours(), date.getMinutes()),
                endTime: padTime(endDateObj.getHours(), endDateObj.getMinutes()),
                service: appt.details.service_name ?? "",
                phone: "",
                note: appt.metadata?.notes ?? "",
                isFullDay: appt.details.is_full_day ?? false,
            };
        });
    }

    return (
        <FeatureGate currentTier={effectiveTier} requiredFeature="CALENDAR_SYNC">
            <div className="h-full flex flex-col p-6 w-full">
                {/* Page Header */}
                <div className="mb-4">
                    <h1 className="text-3xl font-bold text-gray-900">יומן תורים</h1>
                    <p className="text-gray-500 mt-1">ניהול תורים מקומי</p>
                </div>

                <CalendarContainer events={liveEvents} workingHours={workingHours} />
            </div>
        </FeatureGate>
    );
}
