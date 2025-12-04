import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function MonthlyTargetWidget() {
    // Mock data
    const currentRevenue = 25000;
    const targetRevenue = 40000;
    const progress = (currentRevenue / targetRevenue) * 100;
    const remaining = targetRevenue - currentRevenue;

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Target className="text-purple-500" size={20} />
                    היעד החודשי
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Circular Progress Placeholder - using SVG for simplicity */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#f3f4f6"
                            strokeWidth="12"
                            fill="transparent"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="56"
                            stroke="#8b5cf6"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={351.86}
                            strokeDashoffset={351.86 - (351.86 * progress) / 100}
                            className="transition-all duration-1000 ease-out"
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</span>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-500">חסרים לך עוד</p>
                    <p className="text-xl font-bold text-purple-600">₪{remaining.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">להגעה ליעד של ₪{targetRevenue.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>
    );
}
