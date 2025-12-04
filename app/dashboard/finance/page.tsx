import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, DollarSign, CreditCard, ArrowUpRight, ArrowDownRight, MessageSquare } from "lucide-react";

export default function FinancePage() {
    return (
        <div className="p-8 space-y-8 relative min-h-full">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl shadow-sm">
                    📈
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">רועי - ניהול פיננסי</h1>
                    <p className="text-gray-500">תמונת מצב עסקית בזמן אמת</p>
                </div>
                <div className="mr-auto">
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md">
                        <MessageSquare size={18} /> התייעצי עם רועי
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">הכנסות החודש</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">₪42,500</h3>
                            </div>
                            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                                <DollarSign size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={14} /> 12%
                            </span>
                            <span className="text-gray-400">מול חודש שעבר</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">רווח נקי (משוער)</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">₪28,300</h3>
                            </div>
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={14} /> 8%
                            </span>
                            <span className="text-gray-400">מול חודש שעבר</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">הוצאות החודש</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">₪14,200</h3>
                            </div>
                            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-red-600 font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight size={14} /> 2%
                            </span>
                            <span className="text-gray-400">מול חודש שעבר</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden h-full">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                <TrendingUp className="text-green-500" size={20} /> מגמת הכנסות (חצי שנה אחרונה)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Graph Placeholder */}
                            <div className="h-80 w-full bg-gradient-to-b from-green-50 to-white rounded-xl border border-green-100 flex items-end justify-between p-4 px-8 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-green-200 font-bold text-4xl opacity-20 pointer-events-none">
                                    Revenue Chart Placeholder
                                </div>
                                {/* Mock Line Chart Visualization */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                                    <path d="M0,300 Q100,250 200,280 T400,200 T600,150 T800,50" fill="none" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="4" />
                                    <path d="M0,320 L0,300 Q100,250 200,280 T400,200 T600,150 T800,50 L800,320 Z" fill="url(#gradient)" opacity="0.2" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#22c55e" />
                                            <stop offset="100%" stopColor="white" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* X Axis Labels */}
                                <div className="absolute bottom-2 left-8 right-8 flex justify-between text-xs text-gray-400 font-medium">
                                    <span>יולי</span>
                                    <span>אוגוסט</span>
                                    <span>ספטמבר</span>
                                    <span>אוקטובר</span>
                                    <span>נובמבר</span>
                                    <span>דצמבר</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Selling Treatments */}
                <div>
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden h-full">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                <DollarSign className="text-green-500" size={20} /> טיפולים מובילים
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-50">
                                {[
                                    { name: "הסרת שיער גוף מלא", revenue: "₪12,400", count: 18, color: "bg-purple-100 text-purple-600" },
                                    { name: "טיפול פנים קלאסי", revenue: "₪8,200", count: 24, color: "bg-pink-100 text-pink-600" },
                                    { name: "הזרקות (בוטוקס)", revenue: "₪6,500", count: 5, color: "bg-blue-100 text-blue-600" },
                                    { name: "פילינג עמוק", revenue: "₪4,800", count: 8, color: "bg-orange-100 text-orange-600" },
                                    { name: "ייעוץ אסתטי", revenue: "₪2,100", count: 12, color: "bg-gray-100 text-gray-600" },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center font-bold text-sm`}>
                                                {i + 1}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.count} טיפולים</div>
                                            </div>
                                        </div>
                                        <div className="font-bold text-gray-900">{item.revenue}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-gray-50">
                                <Button variant="ghost" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 text-sm">
                                    צפייה בכל הטיפולים
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 left-8 z-50">
                <Button className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110">
                    <MessageSquare size={24} />
                </Button>
            </div>
        </div>
    );
}
