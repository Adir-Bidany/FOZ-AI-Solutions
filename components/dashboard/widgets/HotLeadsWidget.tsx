import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, MessageCircle } from "lucide-react";

export default function HotLeadsWidget() {
    // Mock data
    const leads = [
        { name: "נועה כהן", interest: "בוטוקס", time: "לפני שעה" },
        { name: "יעל לוי", interest: "טיפול פנים", time: "לפני 3 שעות" },
        { name: "שרה אברהם", interest: "ייעוץ", time: "אתמול" },
    ];

    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white rounded-2xl overflow-hidden h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} />
                    לידים חמים
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-gray-50">
                    {leads.map((lead, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{lead.name}</h4>
                                <p className="text-xs text-gray-500">מתעניינת ב{lead.interest} • {lead.time}</p>
                            </div>
                            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0 rounded-full">
                                <MessageCircle size={18} />
                            </Button>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t border-gray-50">
                    <Button variant="ghost" className="w-full text-xs text-gray-500 hover:text-gray-900">
                        צפה בכל הלידים
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
