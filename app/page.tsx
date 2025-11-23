import ChatInterface from "../components/ChatInterface";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Home() {
    return (
        <main className="min-h-screen bg-[#FDFCF8] overflow-hidden relative selection:bg-purple-100">
            {/* אלמנטים גרפיים ברקע (עיגולים מטושטשים לאווירה) */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 py-10 lg:py-0 lg:h-screen flex flex-col lg:flex-row items-center justify-between relative z-10">
                {/* צד ימין: הטקסט השיווקי */}
                <div className="w-full lg:w-1/2 text-center lg:text-right space-y-8 mt-10 lg:mt-0">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-purple-100 text-purple-900 text-sm font-medium shadow-sm mb-4">
                        ✨ חדש: הבינה המלאכותית שתנהל לך את הקליניקה
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]">
                        תפסיקי להפסיד <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                            לקוחות וכסף.
                        </span>
                    </h1>

                    <p className="text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        העוזרת החכמה של FOZ מתחברת לאינסטגרם ולוואטסאפ שלך, עונה
                        למטופלות 24/7, וקובעת תורים ביומן בזמן שאת מטפלת.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                        <Button
                            size="lg"
                            className="rounded-full text-lg px-8 py-6 bg-gray-900 hover:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300"
                        >
                            אני רוצה לנסות בחינם
                            <ArrowLeft className="mr-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full text-lg px-8 py-6 border-gray-300 hover:bg-white hover:border-purple-300 transition-all"
                        >
                            איך זה עובד?
                        </Button>
                    </div>

                    <div className="pt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-500">
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"
                                />
                            ))}
                        </div>
                        <p>הצטרפי ל-100+ קליניקות שכבר בחרו בנו</p>
                    </div>
                </div>

                {/* צד שמאל: הטלפון המרחף (תלת מימד ב-CSS) */}
                <div className="w-full lg:w-1/2 h-[600px] lg:h-[800px] flex items-center justify-center relative perspective-1000">
                    {/* הקונטיינר של הטלפון עם אנימציית ריחוף */}
                    <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[55px] shadow-2xl border-[8px] border-gray-900 overflow-hidden transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out shadow-purple-500/20 ring-1 ring-gray-900/50">
                        {/* המגרעת של האייפון (Notch) */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[30px] w-[120px] bg-black rounded-b-[20px] z-50"></div>

                        {/* תוכן המסך (הצ'אט) */}
                        <div className="w-full h-full bg-white pt-[35px] pb-2">
                            <ChatInterface />
                        </div>

                        {/* השתקפות זכוכית על המסך */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-40 rounded-[45px]"></div>
                    </div>

                    {/* צל בתחתית הטלפון להעצמת הריחוף */}
                    <div className="absolute bottom-[10%] w-[200px] h-[20px] bg-black/20 blur-xl rounded-[100%] transform rotate-y-[-12deg]"></div>
                </div>
            </div>
        </main>
    );
}
