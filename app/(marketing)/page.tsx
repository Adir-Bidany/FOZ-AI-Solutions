import HeroSection from "@/components/HeroSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Calendar,
    TrendingUp,
    Zap,
    Globe,
    ShieldCheck,
    Smartphone,
    Clock,
    Brain,
} from "lucide-react";

export default function Home() {
    return (
        <div
            className="min-h-screen bg-[#FDFCF8] relative overflow-x-hidden selection:bg-purple-100"
            dir="rtl"
        >
            {/* הערה: ה-HeroSection החדש הוא כהה ומכסה את החלק העליון.
               השארתי את אלמנטים הרקע (הבועות הצבעוניות) כי הן מוסיפות אווירה 
               לחלקים התחתונים של הדף (הלבנים).
            */}
            <div className="fixed top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-200/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-200/20 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2 pointer-events-none" />

            {/* === 1. HERO SECTION (החדש והתלת-ממדי) === */}
            <HeroSection />

            {/* === 2. THE WOW FACTOR (הצוות) === */}
            <section className="py-20 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            למה להעסיק עובדת אחת, <br />
                            כשאפשר לקבל{" "}
                            <span className="text-purple-600">מחלקה שלמה?</span>
                        </h2>
                        <p className="text-gray-600 text-lg">
                            הכרנו את הבוט, עכשיו בואי תכירי את הצוות שיעבוד
                            בשבילך מאחורי הקלעים.
                        </p>
                    </div>

                    {/* גריד הצוות */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {/* דניאלה */}
                        <div className="group p-8 rounded-3xl bg-purple-50/50 border border-purple-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-4xl shadow-sm group-hover:scale-110 transition-transform">
                                👩‍💼
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                דניאלה - המזכירה
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                עונה ללקוחות 24/7, וזוכרת אותן. היא יודעת להגיד:
                                'היי נועה, לקבוע לך את הטיפול הרגיל?', בדיוק כמו
                                מזכירה אנושית שמכירה את הלקוחות אישית
                            </p>
                        </div>

                        {/* מיכל */}
                        <div className="group p-8 rounded-3xl bg-pink-50/50 border border-pink-100 hover:shadow-xl hover:border-pink-200 transition-all duration-300 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-200 to-transparent opacity-20 rounded-bl-full"></div>
                            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-4xl shadow-sm group-hover:scale-110 transition-transform">
                                🚀
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                מיכל - השיווק
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                מזהה כשהיומן שלך ריק ונותנת לך רעיונות לסטוריז
                                ופוסטים שיביאו לקוחות <strong>עכשיו</strong>.
                                היא הופכת את העוקבות שלך ללקוחות משלמות.
                            </p>
                        </div>

                        {/* רועי */}
                        <div className="group p-8 rounded-3xl bg-blue-50/50 border border-blue-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-4xl shadow-sm group-hover:scale-110 transition-transform">
                                📈
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                רועי - האנליסט
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                שומר על הכיס שלך. מציג לך נתונים ברורים על
                                הכנסות, ביטולים וצמיחה, ועוזר לך לקבל החלטות
                                עסקיות חכמות בזמן אמת.
                            </p>
                        </div>
                    </div>

                    {/* פיצ'רים נוספים */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shrink-0">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-1">
                                    הקמת עסק בשיחה (Zero-Tech)
                                </h4>
                                <p className="text-sm text-gray-600">
                                    בלי הגדרות מסובכות. פשוט ספרי לבוט שלנו על
                                    העסק שלך בשיחה רגילה, ואנחנו נבנה לך את כל
                                    המערכת בתוך דקות.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-xl flex items-center justify-center shrink-0">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900 mb-1">
                                    אתר אישי מיידי
                                </h4>
                                <p className="text-sm text-gray-600">
                                    אנחנו מייצרים לך מיד לינק אישי מעוצב שהוא
                                    כרטיס הביקור הדיגיטלי שלך. חוסך לך אלפי
                                    שקלים על בניית אתר.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === 3. THE FOUNDATION (יתרונות טכניים) === */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl font-bold text-gray-900">
                            הבסיס החזק לשקט הנפשי שלך
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 max-w-5xl mx-auto">
                        {[
                            {
                                title: "זמינות 24/7",
                                desc: "מענה ללקוחות גם ב-2 בלילה, כשהם הכי חמים לסגירה.",
                                icon: Clock,
                            },
                            {
                                title: "סנכרון יומן מלא",
                                desc: "מחובר ל-SimplyBook. אין כפילויות, אין טעויות.",
                                icon: Calendar,
                            },
                            {
                                title: "מכירות אקטיביות",
                                desc: "הבוט לא רק עונה, הוא מוכר. יודע להציע טיפולים משלימים.",
                                icon: TrendingUp,
                            },
                            {
                                title: "חוויה ללא אפליקציה",
                                desc: "הלקוחות שלך לא צריכות להוריד כלום. לינק אחד והכל עובד.",
                                icon: Smartphone,
                            },
                            {
                                title: "אבטחה ופרטיות",
                                desc: "המידע שלך ושל הלקוחות שלך מאובטח בסטנדרטים הגבוהים ביותר.",
                                icon: ShieldCheck,
                            },
                            {
                                title: "זיכרון ארגוני חכם",
                                desc: "העוזרת זוכרת היסטוריית טיפולים ומחירים לכל לקוחה, בדיוק כמוך",
                                icon: Brain,
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-10 h-10 bg-white text-gray-600 rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-200">
                                    <item.icon size={20} />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === 4. CTA (הנעה לפעולה תחתונה) === */}
            <section className="py-20 bg-gray-900 text-white text-center px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                        מוכנה לשדרג את העסק שלך?
                    </h2>
                    <p className="text-gray-300 text-lg">
                        הצטרפי למאות בעלות עסקים שכבר נותנות ל-AI לעבוד בשבילן.
                        <br />
                        בלי התחייבות, בלי כרטיס אשראי בהרשמה.
                    </p>
                    <Link href="/onboarding">
                        <Button className="h-16 px-12 text-xl rounded-full bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            תתחילו לעבוד בשבילי 🚀
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
