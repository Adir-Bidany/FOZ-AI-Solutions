import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Business from "@/models/Business";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";
import SimplyBookConnect from "@/components/dashboard/SimplyBookConnect";
import { Calendar as CalendarIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CalendarPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    await connectToDatabase();
    const business = await Business.findOne({ ownerEmail: session.user.email }).lean();

    // Check connection status
    const simplyBookLogin = business?.integrations?.simplybook?.companyLogin;

    // If not connected, show the connection form
    if (!simplyBookLogin) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">חיבור יומן</h1>
                        <p className="text-gray-500">נראה שעדיין לא חיברת את יומן SimplyBook שלך.</p>
                    </div>
                    <SimplyBookConnect />
                </div>
            </div>
        );
    }

    // If connected, show the Calendar View
    const calendarUrl = `https://${simplyBookLogin}.simplybook.me/v2/#admin/schedule/view`;

    return (
        <div className="h-full flex flex-col p-6 w-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">יומן תורים</h1>
                    <p className="text-gray-500 mt-1">מחובר לחשבון: {simplyBookLogin}</p>
                </div>
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2">
                        <ExternalLink size={16} />
                        פתח בחלון חדש
                    </Button>
                </a>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
                <iframe
                    src={calendarUrl}
                    className="w-full h-full border-none"
                    title="SimplyBook Admin"
                />
            </div>
        </div>
    );
}
