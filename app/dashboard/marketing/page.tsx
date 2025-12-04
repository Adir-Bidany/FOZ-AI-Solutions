import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Megaphone, MessageSquare, TrendingUp, Calendar, Image as ImageIcon, Send } from "lucide-react";

export default function MarketingPage() {
    return (
        <div className="p-8 space-y-8 relative min-h-full">
            {/* Header */}
            <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-3xl shadow-sm">
                    🚀
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">מיכל - ניהול שיווק</h1>
                    <p className="text-gray-500">האסטרטגיה הדיגיטלית שלך במקום אחד</p>
                </div>
                <div className="mr-auto">
                    <Button className="gap-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-md">
                        <MessageSquare size={18} /> התייעצי עם מיכל
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Performance */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                <TrendingUp className="text-pink-500" size={20} /> ביצועי קמפיינים (חודשי)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Graph Placeholder */}
                            <div className="h-64 w-full bg-gradient-to-b from-pink-50 to-white rounded-xl border border-pink-100 flex items-end justify-between p-4 px-8 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-pink-200 font-bold text-4xl opacity-20 pointer-events-none">
                                    Graph Placeholder
                                </div>
                                {/* Mock Bars */}
                                <div className="w-12 h-[40%] bg-pink-200 rounded-t-md relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">1.2k</div>
                                </div>
                                <div className="w-12 h-[60%] bg-pink-300 rounded-t-md relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">2.4k</div>
                                </div>
                                <div className="w-12 h-[50%] bg-pink-200 rounded-t-md relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">1.8k</div>
                                </div>
                                <div className="w-12 h-[80%] bg-pink-500 rounded-t-md shadow-lg relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">3.2k</div>
                                </div>
                                <div className="w-12 h-[65%] bg-pink-300 rounded-t-md relative group">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">2.6k</div>
                                </div>
                            </div>
                            <div className="flex justify-between mt-4 text-sm text-gray-500 font-medium">
                                <span>שבוע 1</span>
                                <span>שבוע 2</span>
                                <span>שבוע 3</span>
                                <span>שבוע 4</span>
                                <span>שבוע 5</span>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                        <Megaphone size={20} />
                                    </div>
                                    <h3 className="font-bold text-lg">קמפיין פעיל</h3>
                                </div>
                                <p className="text-purple-100 mb-6 text-sm leading-relaxed">
                                    "מבצע חורף - 20% הנחה על טיפולי פנים"
                                    <br />
                                    רץ כרגע באינסטגרם ובפייסבוק.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold">14 לידים</div>
                                    <Button size="sm" variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50 border-none">
                                        ניהול
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                            <CardHeader className="border-b border-gray-50 pb-3 pt-5">
                                <CardTitle className="text-base font-bold text-gray-800">רעיונות לסטורי</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 shrink-0">
                                            💡
                                        </div>
                                        <div className="text-sm text-gray-600">טיפ: איך לשמור על עור הפנים בחורף?</div>
                                    </div>
                                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                            📸
                                        </div>
                                        <div className="text-sm text-gray-600">לפני/אחרי: טיפול באקנה</div>
                                    </div>
                                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                            ❓
                                        </div>
                                        <div className="text-sm text-gray-600">שאלות תשובות עם העוקבות</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Sidebar - Upcoming Posts */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden h-full">
                        <CardHeader className="border-b border-gray-50 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                                <Calendar className="text-pink-500" size={20} /> פוסטים מתוכננים
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-gray-50">
                                {[
                                    { date: "מחר, 10:00", title: "טיפים לחורף", status: "מוכן", img: "bg-blue-100" },
                                    { date: "יום ג׳, 18:00", title: "לקוחה ממליצה", status: "בטיוטה", img: "bg-purple-100" },
                                    { date: "יום ה׳, 12:00", title: "מבצע סופ״ש", status: "ממתין לאישור", img: "bg-orange-100" },
                                ].map((post, i) => (
                                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors group">
                                        <div className="flex gap-3">
                                            <div className={`w-12 h-12 rounded-lg ${post.img} flex items-center justify-center text-gray-400 shrink-0`}>
                                                <ImageIcon size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-medium text-pink-600 mb-0.5">{post.date}</div>
                                                <div className="font-bold text-gray-900 text-sm">{post.title}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${post.status === "מוכן" ? "bg-green-500" : "bg-amber-500"}`}></span>
                                                    {post.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-gray-50">
                                <Button variant="outline" className="w-full gap-2 border-dashed border-gray-300 text-gray-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50">
                                    <Send size={16} /> תזמון פוסט חדש
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-8 left-8 z-50">
                <Button className="h-14 w-14 rounded-full bg-pink-600 hover:bg-pink-700 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110">
                    <MessageSquare size={24} />
                </Button>
            </div>
        </div>
    );
}
