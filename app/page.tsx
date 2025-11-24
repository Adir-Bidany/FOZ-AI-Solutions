import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/ChatInterface";
import {
    ArrowLeft,
    CheckCircle2,
    Calendar,
    MessageCircle,
    BarChart3,
    Zap,
    ShieldCheck,
} from "lucide-react";

export default function Home() {
    return (
        <main
            className="min-h-screen bg-[#FDFCF8] relative overflow-x-hidden selection:bg-purple-100"
            dir="rtl"
        >
            {/* רקע אווירה */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

            {/* === HEADER === */}
            <div className="container mx-auto px-6 pt-6">
                <header className="flex justify-between items-center w-full">
                    <div className="relative w-32 h-12 lg:w-40 lg:h-16 shrink-0">
                        <Image
                            src="/logo.png"
                            alt="FOZ AI Solutions"
                            fill
                            className="object-contain object-right"
                            priority
                        />
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin" className="hidden lg:block">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <ShieldCheck size={16} />
                            </Button>
                        </Link>
                        <Link href="/onboarding">
                            <Button
                                variant="outline"
                                className="rounded-full border-gray-300 hover:bg-gray-50"
                            >
                                כניסת עסקים
                            </Button>
                        </Link>
                    </div>
                </header>
            </div>

            {/* === HERO SECTION === */}
            <section className="container mx-auto px-6 py-10 lg:py-20">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
                    {/* צד ימין: הטקסט */}
                    <div className="w-full lg:w-1/2 text-center lg:text-right space-y-6 lg:space-y-8 z-10">
                        <div className="inline-flex items-center bg-white border border-purple-100 text-purple-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm mx-auto lg:mx-0">
                            <span className="ml-2">✨</span> המהפכה של עולם
                            האסתטיקה
                        </div>

                        <h1 className="text-4xl lg:text-7xl font-bold text-gray-900 leading-[1.15] tracking-tight">
                            העוזרת האישית שמוכרת{" "}
                            <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                                פי 3 יותר
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            תני לבינה המלאכותית שלנו לנהל את שיחות הוואטסאפ,
                            לקבוע תורים ביומן ולמכור טיפולים - גם כשאת באמצע
                            טיפול או ישנה.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                            <Link
                                href="/onboarding"
                                className="w-full sm:w-auto"
                            >
                                <Button className="w-full h-14 px-8 text-lg rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all group">
                                    אני רוצה להתחיל בחינם
                                    <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>

                        <p className="text-sm text-gray-500 mt-4">
                            🎁 14 יום ניסיון חינם • ללא התחייבות • הקמה בדקה
                        </p>
                    </div>

                    {/* צד שמאל: הדמו החי */}
                    <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative mt-8 lg:mt-0">
                        <div className="relative w-[280px] h-[580px] lg:w-[320px] lg:h-[650px]">
                            <div className="absolute -top-10 right-0 lg:-right-4 bg-white px-4 py-2 rounded-xl shadow-lg text-sm font-bold text-purple-700 rotate-[-3deg] animate-bounce z-30 border border-purple-50 whitespace-nowrap">
                                👇 נסי אותי! אני מחוברת ליומן...
                            </div>
                            <div className="w-full h-full bg-gray-900 rounded-[3rem] p-3 shadow-2xl ring-4 ring-gray-900/10 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 perspective-1000">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-2xl z-20"></div>
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative z-10 border border-gray-100">
                                    {/* כאן אנחנו מעבירים קונפיגורציה של דמו */}
                                    <ChatInterface
                                        businessConfig={{
                                            businessName: "FOZ Sales AI",
                                            ownerName: "FOZ Team",
                                            tone: "מכירתי, חד, אינטליגנטי ומניע לפעולה",
                                            domainGuidelines: `
    הוראה קריטית: אתה מדמה איש מכירות של חברת תוכנה (SaaS).
    המטרה שלך היא לתת מידע על מחיר המנוי לתוכנה.
    זהו אינו ייעוץ פיננסי ואינו ייעוץ השקעות. מדובר במחירון שירות בלבד.
    
    תפקידך:
    למכור את המערכת לקוסמטיקאיות שנכנסות לאתר.
    
    תסריט שיחה:
    - אם שואלים "כמה זה עולה?": תגיד שזה עולה פחות מטיפול פנים אחד בחודש. (אל תחשוש לדבר על מחירים, זה מחירון תוכנה).
    - תמיד תציע "משחק תפקידים": "בואי נשחק. תכתבי לי שאת רוצה לבטל תור, ותראי איך אני מונע ממך לעזוב".
    - הדגש את היתרונות: צוות דיגיטלי מלא (מזכירה, שיווק, אנליסט), מנוע תובנות, ואפס זמן הקמה.
    
    כלל ברזל: היה קצר, שיווקי וחד. אל תתנצל ואל תגיד "אני מודל שפה".
  `,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* === FEATURES SECTION === */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            יותר מסתם צ'אטבוט. העובדת המצטיינת שלך.
                        </h2>
                        <p className="text-gray-600">
                            בזמן שאת מטפלת בלקוחות, FOZ דואגת למלא לך את היומן
                            למחר.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "מחובר ליומן שלך",
                                desc: "אינטגרציה מלאה ל-SimplyBook. הבוט רואה מתי את פנויה וקובע תורים בזמן אמת.",
                                icon: Calendar,
                                color: "bg-blue-100 text-blue-600",
                            },
                            {
                                title: "מדברת כמוך",
                                desc: "בינה מלאכותית שלומדת את הסגנון שלך. יוקרתי, חברי או תכליתי - את בוחרת.",
                                icon: MessageCircle,
                                color: "bg-purple-100 text-purple-600",
                            },
                            {
                                title: "מגדילה מכירות",
                                desc: "לא רק עונה, אלא מוכרת. הבוט יודע להציע טיפולים משלימים ולסגור עסקאות.",
                                icon: TrendingUp,
                                color: "bg-green-100 text-green-600",
                            },
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow"
                            >
                                <div
                                    className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}
                                >
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* === HOW IT WORKS === */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-16">
                        איך זה עובד? פשוט וקל.
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* קו מחבר (דקורטיבי) */}
                        <div className="hidden md:block absolute top-8 left-1/6 right-1/6 h-0.5 bg-gray-700 -z-10"></div>

                        {[
                            {
                                step: "1",
                                title: "הרשמה מהירה",
                                desc: "מכניסים את פרטי העסק ומחברים את היומן בדקה אחת.",
                            },
                            {
                                step: "2",
                                title: "מקבלים לינק",
                                desc: "המערכת יוצרת לך מיד אתר חכם משלך עם הבוט.",
                            },
                            {
                                step: "3",
                                title: "מתחילים לעבוד",
                                desc: "שמים את הלינק בביו באינסטגרם ורואים את היומן מתמלא.",
                            },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="relative z-10 flex flex-col items-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold shadow-[0_0_20px_rgba(147,51,234,0.5)] mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-gray-400 max-w-xs">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16">
                        <Link href="/onboarding">
                            <Button className="h-16 px-10 text-xl rounded-full bg-white text-gray-900 hover:bg-gray-100 font-bold">
                                אני רוצה לנסות עכשיו 🚀
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* === FOOTER === */}
            <footer className="py-8 bg-white border-t border-gray-100 text-center text-gray-500 text-sm">
                <p>© 2024 FOZ AI Solutions. כל הזכויות שמורות.</p>
            </footer>
        </main>
    );
}

// אייקון חסר שצריך לייבא
import { TrendingUp } from "lucide-react";
