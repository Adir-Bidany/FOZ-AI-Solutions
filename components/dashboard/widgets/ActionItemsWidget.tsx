import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

export default function ActionItemsWidget() {
    // Mock data
    const actions = [
        { title: "מיכל יצרה פוסט חדש", type: "marketing", agent: "Michal" },
        { title: "רועי מציע העלאת מחיר", type: "finance", agent: "Roi" },
        { title: "אישור ימי חופשה", type: "admin", agent: "Golda" },
    ];

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl overflow-hidden h-full relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <CardHeader className="pb-2 relative z-10">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-yellow-300" size={20} />
                    משימות לביצוע
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative z-10">
                <div className="divide-y divide-white/10">
                    {actions.map((action, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                <span className="text-sm font-medium">{action.title}</span>
                            </div>
                            <Button size="sm" variant="secondary" className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-none">
                                סקירה
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
