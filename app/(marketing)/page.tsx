import HeroSection from "@/components/HeroSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    LineChart,
    Lock,
    Clock,
    Share2,
    Brain,
    ShieldCheck
} from "lucide-react";

export default function Home() {
    return (
        <div
            className="min-h-screen bg-[#0B0E14] text-white relative overflow-x-hidden selection:bg-purple-500"
            dir="rtl"
        >
            {/* === 1. HERO SECTION === */}
            <HeroSection />

            {/* === 2. AI EXECUTIVE SUITE === */}
            <section className="py-20 bg-transparent relative z-10 border-t border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            הכירו את צוות ההנהלה החדש שלכם
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            ארבעה סוכני AI שעובדים בסנכרון מלא והופכים את העסק שלכם לאוטונומי לחלוטין
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                emoji: "👑",
                                name: "גולדה",
                                role: "הסוכנת הראשית (CEO)",
                                desc: "המנהלת הבלעדית. מסנכרנת את כל הסוכנים, מנהלת את בסיס המידע ומבצעת כל הנחיה ניהולית בשפה חופשית.",
                                color: "from-amber-500/20 to-yellow-500/5",
                                borderColor: "border-amber-500/20"
                            },
                            {
                                emoji: "🎧",
                                name: "דניאלה",
                                role: "שירות, תפעול ותורים",
                                desc: "עונה ללקוחות 24/7, קובעת ומבטלת תורים, ומזהה את היסטוריית הטיפולים האישית של כל לקוח.",
                                color: "from-blue-500/20 to-cyan-500/5",
                                borderColor: "border-blue-500/20"
                            },
                            {
                                emoji: "📢",
                                name: "מיכל",
                                role: "שיווק וצמיחה אקטיבית",
                                desc: "מציעה קמפיינים ורעיונות לגידול במכירות, ומפרסמת פוסטים ברשתות החברתיות בלחיצת כפתור אחת.",
                                color: "from-pink-500/20 to-rose-500/5",
                                borderColor: "border-pink-500/20"
                            },
                            {
                                emoji: "📊",
                                name: "רועי",
                                role: "סוכן פיננסי ו-BI",
                                desc: "מנתח רווחיות בזמן אמת, מנטר את ביצועי העסק ומציע אקטיבית המלצות להתייעלות וחיסכון.",
                                color: "from-emerald-500/20 to-green-500/5",
                                borderColor: "border-emerald-500/20"
                            }
                        ].map((agent, idx) => (
                            <div key={idx} className={`p-8 rounded-3xl bg-gradient-to-b ${agent.color} border ${agent.borderColor} bg-white/5 backdrop-blur-sm hover:scale-105 transition-transform`}>
                                <div className="text-4xl mb-4">{agent.emoji}</div>
                                <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                                <div className="text-sm text-purple-400 mb-3 font-medium">{agent.role}</div>
                                <p className="text-gray-400 text-sm leading-relaxed">{agent.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === 3. 5-MINUTE ONBOARDING WIZARD === */}
            <section className="py-20 bg-white/5 border-y border-white/5 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            מעסק רגיל לאוטונומי ב-5 דקות
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            תהליך הקמה פשוט ומהיר. בלי מתכנתים. בלי סוכנויות.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: "1",
                                title: "השאלון (2 דק')",
                                desc: "עונים על מספר שאלות בסיסיות על העסק והשירותים"
                            },
                            {
                                step: "2",
                                title: "הבנייה האוטומטית (שניות)",
                                desc: "ה-AI מפיק עבורך אתר אינטרנט מעוצב, דשבורד ניהול מלא ואימון ל-4 הסוכנים"
                            },
                            {
                                step: "3",
                                title: "עבודה אוטונומית",
                                desc: "דניאלה מקבלת תורים, מיכל מציעה פוסטים וגולדה מנהלת את העסק"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="relative flex flex-col items-center text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl font-bold text-purple-400 mb-6 z-10">
                                    {item.step}
                                </div>
                                {idx !== 2 && (
                                    <div className="hidden md:block absolute top-14 left-[-50%] w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                                )}
                                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === 4. CORE FEATURES & DASHBOARD === */}
            <section className="py-20 bg-transparent relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            הדשבורד והפיצ'רים שמשנים את חוקי המשחק
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 max-w-6xl mx-auto">
                        {[
                            {
                                title: "דשבורד CRM & LTV",
                                desc: "מעקב מדויק אחר הכנסות מצטברות לפי לקוח, ניהול מאגר וניטור שיחות AI",
                                icon: LineChart,
                            },
                            {
                                title: "אישור לקוחות חכם (Gated Access)",
                                desc: "לקוח שנרשם יורשה לבצע פעולות מול דניאלה רק לאחר אישור ידני מבעל העסק",
                                icon: Lock,
                            },
                            {
                                title: "זמינות ומענה 24/7",
                                desc: "דניאלה עונה ללקוחות גם ב-2 בלילה, חוסכת שיחות מציקות ומספקת מידע מדויק",
                                icon: Clock,
                            },
                            {
                                title: "פרסום פוסטים בקליק",
                                desc: "מיכל מנסחת תוכן שיווקי ומעלים אותו לרשתות החברתיות באישור בלבד",
                                icon: Share2,
                            },
                            {
                                title: "זיכרון ארגוני מותאם",
                                desc: "המערכת זוכרת היסטוריית טיפולים, העדפות ומחירים לכל לקוח באופן אישי",
                                icon: Brain,
                            },
                            {
                                title: "אבטחה ופרטיות בסטנדרט גבוה",
                                desc: "המידע העסקי והפיננסי מוגן ברמה הגבוהה ביותר",
                                icon: ShieldCheck,
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                            >
                                <div className="w-12 h-12 bg-white/5 text-purple-400 rounded-full flex items-center justify-center shadow-sm mb-4 border border-white/10">
                                    <item.icon size={24} />
                                </div>
                                <h4 className="font-bold text-white mb-3 text-lg">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === 5. CTA (הנעה לפעולה תחתונה) === */}
            <section className="py-24 bg-transparent text-white text-center px-6 relative overflow-hidden border-t border-white/5">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                        מוכן להעביר את העסק לטייס אוטומטי?
                    </h2>
                    <p className="text-gray-300 text-xl max-w-2xl mx-auto">
                        הצטרף לבעלי עסקים שכבר חוסכים עשרות שעות בחודש ומגדילים הכנסות עם הצוות של FOZ AI Solutions
                    </p>
                    <Link href="/onboarding" className="inline-block mt-4">
                        <Button className="h-16 px-12 text-xl rounded-full bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all font-bold shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-blue-500">
                           הירשמו עכשיו ובעוד 5 דק' תקבלו אתר אינטרנט, דשבורד ניהול ו-4 סוכני AI
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
