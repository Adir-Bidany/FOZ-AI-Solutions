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
            className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-purple-500"
            dir="rtl"
        >
            {/* === 1. HERO SECTION === */}
            <HeroSection />

            {/* === 2. AI EXECUTIVE SUITE === */}
            <section className="py-20 bg-transparent relative z-10 border-t border-border">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            הכירו את צוות ה-AI שמזניק את העסק שלכם
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            שני סוכני AI עוצמתיים שעובדים בסנכרון מלא והופכים את העסק שלכם לאוטונומי, יעיל ורווחי יותר
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                             
                                name: "גולדה",
                                role: "מנהלת העסק וסמנכ\"לית צמיחה",
                                desc: "הסוכנת הפנימית שלך. מנהלת את\ המשימות, מנסחת תוכן שיווקי ופוסטים בקליק, ומנתחת דוחות כספיים, תקציבים וסיכוני נטישה - הכל בשיחה טבעית.",
                                color: "from-amber-500/10 to-yellow-500/5",
                                borderColor: "border-amber-500/30"
                            },
                            {
                            
                                name: "דניאלה",
                                role: "נציגת שירות, מכירות ותורים",
                                desc: "הפנים האוטונומיות של העסק שלך ברשת. עונה ללקוחות 24/7 באתר, מציגה שירותים, קובעת תורים ביומן, ומזהה את ההיסטוריה והצרכים של כל לקוח.",
                                color: "from-blue-500/10 to-cyan-500/5",
                                borderColor: "border-blue-500/30"
                            }
                        ].map((agent, idx) => (
                            <div key={idx} className={`p-8 rounded-3xl bg-card text-card-foreground border ${agent.borderColor} shadow-sm hover:scale-[1.02] transition-transform`}>
                              
                                <h3 className="text-2xl font-bold text-foreground mb-1">{agent.name}</h3>
                                <div className="text-sm text-purple-500 dark:text-purple-400 mb-3 font-semibold">{agent.role}</div>
                                <p className="text-muted-foreground text-base leading-relaxed">{agent.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === 3. 5-MINUTE ONBOARDING WIZARD === */}
            <section className="py-20 bg-accent/30 border-y border-border relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            מעסק רגיל לאוטונומי ב-5 דקות
                        </h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            תהליך הקמה פשוט ומהיר. בלי מתכנתים. בלי סוכנויות.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: "1",
                                title: "השאלון (2 דק')",
                                desc: "עונים על מספר שאלות בסיסיות על העסק, השירותים והטון המבוקש"
                            },
                            {
                                step: "2",
                                title: "הבנייה האוטומטית (שניות)",
                                desc: "ה-AI מפיק עבורך אתר אינטרנט מעוצב, דשבורד ניהול מלא ואימון ייעודי לסוכנים"
                            },
                            {
                                step: "3",
                                title: "עבודה אוטונומית",
                                desc: "פז מקבלת פניות ותורים באתר, וגולדה מנהלת עבורך את השיווק, התקציב והמשימות בדשבורד"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="relative flex flex-col items-center text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 z-10">
                                    {item.step}
                                </div>
                                {idx !== 2 && (
                                    <div className="hidden md:block absolute top-14 left-[-50%] w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                                )}
                                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === 4. CORE FEATURES & DASHBOARD === */}
            <section className="py-20 bg-transparent relative z-10">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            הדשבורד והפיצ'רים שמשנים את חוקי המשחק
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 max-w-6xl mx-auto">
                        {[
                            {
                                title: "דשבורד ניהול ו-CRM חכם",
                                desc: "מעקב אחר לקוחות, ניטור שיחות AI וניתוח מדדים עסקיים מרכזיים",
                               
                            },
                            {
                                title: "אישור לקוחות חכם",
                                desc: "שליטה מלאה בגישת לקוחות ואישור תורים מול נציגת ה-AI",
                              
                            },
                            {
                                title: "מענה ומכירות 24/7",
                                desc: "פז עונה לפניות בכל שעה באתר, מציגה שירותים וחוסכת זמן יקר",
                               
                            },
                            {
                                title: "יצירת תוכן שיווקי בקליק",
                                desc: "גולדה מנסחת פוסטים ורעיונות לקמפיינים הממתינים לאישורך בדשבורד",
                              
                            },
                            {
                                title: "זיכרון ארגוני ואורכב שיחות",
                                desc: "המערכת שומרת את היסטוריית השיחות, וגולדה מסוגלת לשלוף מידע משיחות עבר",
                               
                            },
                            {
                                title: "אבטחה ופרטיות בסטנדרט גבוה",
                                desc: "הגנה מלאה על המידע העסקי והפיננסי של העסק",
                               
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border text-card-foreground shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h4 className="font-bold text-foreground mb-3 text-lg">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === 5. CTA (הנעה לפעולה תחתונה) === */}
            <section className="py-24 bg-transparent text-foreground text-center px-6 relative overflow-hidden border-t border-border">
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight text-foreground">
                        מוכן להעביר את העסק לטייס אוטומטי?
                    </h2>
                    <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                        הצטרף לבעלי עסקים שכבר חוסכים עשרות שעות בחודש ומגדילים הכנסות עם הצוות של FOZ AI Solutions
                    </p>
                    <Link href="/onboarding" className="inline-block mt-4">
                        <Button className="h-16 px-12 text-xl rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all font-bold shadow-[0_0_30px_rgba(147,51,234,0.35)] border border-primary/60">
                          הצטרפו למהפכה
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
