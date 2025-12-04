import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar } from "lucide-react";

export default function DailyPulseWidget() {
    // Mock data
    const todayRevenue = 1250;
    const tomorrowOccupancy = 40; // Percentage

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="text-green-500" size={20} />
                    דופק עסקי
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <p className="text-sm text-gray-500 mb-1">הכנסות היום</p>
                    <h3 className="text-3xl font-bold text-gray-900">₪{todayRevenue.toLocaleString()}</h3>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">תפוסה למחר</span>
                        <span className={`font-bold ${tomorrowOccupancy < 50 ? "text-red-500" : "text-green-600"}`}>
                            {tomorrowOccupancy}%
                        </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${tomorrowOccupancy < 50 ? "bg-red-400" : "bg-green-500"}`}
                            style={{ width: `${tomorrowOccupancy}%` }}
                        />
                    </div>
                    {tomorrowOccupancy < 50 && (
                        <Button variant="outline" size="sm" className="w-full mt-2 text-xs border-red-200 text-red-600 hover:bg-red-50">
                            <Calendar size={14} className="ml-1" />
                            מלא את היומן למחר
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
