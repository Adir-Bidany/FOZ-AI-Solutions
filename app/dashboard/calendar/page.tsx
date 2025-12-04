import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

    return (
        <div className="p-8 space-y-8 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">יומן תורים</h1>
                    <p className="text-gray-500 mt-1">ניהול הלו״ז שלך</p>
                </div>
                <Link href="/dashboard/integrations/simplybook">
                    <Button variant="outline" className="gap-2 text-gray-600 border-gray-300 hover:bg-gray-50">
                        <RefreshCw size={16} /> סנכרון עם SimplyBook
                    </Button>
                </Link>
            </div>

            <Card className="flex-1 border-none shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <CalendarIcon size={20} className="text-purple-600" />
                            שבוע נוכחי (3 - 9 בדצמבר)
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm">היום</Button>
                            <Button variant="ghost" size="sm">שבוע הבא &gt;</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-auto">
                    <div className="grid grid-cols-8 h-full min-w-[800px]">
                        {/* Time Column */}
                        <div className="border-l border-gray-100 bg-gray-50/50">
                            <div className="h-12 border-b border-gray-100"></div>
                            {hours.map((hour) => (
                                <div key={hour} className="h-20 border-b border-gray-100 flex items-start justify-center pt-2 text-xs text-gray-400 font-medium">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {days.map((day, dayIndex) => (
                            <div key={day} className="border-l border-gray-100 relative group">
                                <div className="h-12 border-b border-gray-100 flex items-center justify-center font-bold text-gray-700 bg-gray-50/30">
                                    {day}
                                </div>
                                {hours.map((hour) => (
                                    <div key={hour} className="h-20 border-b border-gray-50 group-hover:bg-gray-50/30 transition-colors"></div>
                                ))}

                                {/* Mock Appointments */}
                                {dayIndex === 0 && (
                                    <div className="absolute top-[140px] left-1 right-1 h-[70px] bg-purple-100 border-l-4 border-purple-500 rounded-md p-2 text-xs hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="font-bold text-purple-700">הסרת שיער בלייזר</div>
                                        <div className="text-purple-600 flex items-center gap-1 mt-1">
                                            <Clock size={10} /> 10:00 - 11:00
                                        </div>
                                        <div className="text-purple-500 mt-1">דנה לוי</div>
                                    </div>
                                )}
                                {dayIndex === 2 && (
                                    <div className="absolute top-[300px] left-1 right-1 h-[70px] bg-pink-100 border-l-4 border-pink-500 rounded-md p-2 text-xs hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="font-bold text-pink-700">טיפול פנים</div>
                                        <div className="text-pink-600 flex items-center gap-1 mt-1">
                                            <Clock size={10} /> 12:00 - 13:00
                                        </div>
                                        <div className="text-pink-500 mt-1">מיכל כהן</div>
                                    </div>
                                )}
                                {dayIndex === 4 && (
                                    <div className="absolute top-[460px] left-1 right-1 h-[70px] bg-blue-100 border-l-4 border-blue-500 rounded-md p-2 text-xs hover:shadow-md transition-shadow cursor-pointer">
                                        <div className="font-bold text-blue-700">ייעוץ ראשוני</div>
                                        <div className="text-blue-600 flex items-center gap-1 mt-1">
                                            <Clock size={10} /> 14:00 - 15:00
                                        </div>
                                        <div className="text-blue-500 mt-1">רונית אברהם</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
