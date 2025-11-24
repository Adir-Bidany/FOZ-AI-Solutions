import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Check, Clock } from "lucide-react";
import Image from "next/image";

// פונקציה שמדמה שליפת נתונים מה-DB (בשלב הבא נחבר למונגו)
async function getClientData(slug: string) {
    return {
        businessName: "קליניקת Glow & Shine",
        ownerName: "יעל כהן",
        tone: "יוקרתי ומקצועי",
        domainGuidelines:
            "מומחית להזרקות, פיסול פנים וטיפולי זוהר. מחירים: בוטוקס אזור אחד 600, חומצה מזרק ראשון 1400.",
        heroImage:
            "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop", // תמונה יוקרתית לדוגמה
        address: "דיזינגוף 100, תל אביב",
        phone: "050-1234567",
    };
}

// שינוי הגדרת הטיפוס ל-Promise
export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  // המתנה לפרמטרים
  const resolvedParams = await params;
  const clientData = await getClientData(resolvedParams.slug);

    return (
        <div className="min-h-screen bg-white text-gray-900" dir="rtl">
            {/* === Header: לוגו וטלפון === */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight">
                        {clientData.businessName}
                    </div>
                    <a
                        href={`tel:${clientData.phone}`}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
                    >
                        <Phone size={16} />
                        <span className="hidden sm:inline">
                            {clientData.phone}
                        </span>
                    </a>
                </div>
            </header>

            <main>
                {/* === HERO SECTION: המקום שבו קורה הקסם === */}
                {/* מסך מפוצל: ימין טקסט ותמונה, שמאל הצ'אט תמיד פתוח */}
                <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
                            {/* צד ימין: המכירה */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 z-10">
                                <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium w-fit">
                                    <Star size={14} fill="currentColor" />{" "}
                                    המומלצת ביותר בתל אביב
                                </div>

                                <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] text-gray-900">
                                    להתעורר כל בוקר <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                                        בגרסה הכי יפה שלך
                                    </span>
                                </h1>

                                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                    טיפולי אסתטיקה מתקדמים בהתאמה אישית. בלי
                                    ניתוחים, בלי כאבים, ועם תוצאות טבעיות שיגרמו
                                    לכולם לשאול מה עשית.
                                </p>

                                {/* רשימת תועלות מהירה */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                    {[
                                        "חומרים באישור FDA",
                                        "ייעוץ אישי חינם",
                                        "קליניקה בוטיק פרטית",
                                        "חניה צמודה",
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2 text-sm text-gray-700"
                                        >
                                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                <Check
                                                    size={12}
                                                    className="text-green-600"
                                                />
                                            </div>
                                            {item}
                                        </div>
                                    ))}
                                </div>

                                {/* תמונת אווירה (במובייל תהיה מתחת, בדסקטופ בצד) */}
                                <div className="mt-8 relative h-64 w-full rounded-3xl overflow-hidden shadow-xl lg:hidden">
                                    <Image
                                        src={clientData.heroImage}
                                        alt="Clinic"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* צד שמאל: הצ'אט (היומן האוטומטי) */}
                            {/* זה העיצוב החדש: כרטיס צף יוקרתי, לא "טלפון" */}
                            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                                {/* רקע דקורטיבי מאחורי הצ'אט */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-100/50 to-pink-100/50 rounded-full blur-3xl -z-10"></div>

                                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden h-[600px] flex flex-col relative z-20">
                                    {/* כותרת הצ'אט */}
                                    <div className="bg-gray-900 text-white p-4 text-center">
                                        <p className="text-sm opacity-80">
                                            רוצה לבדוק זמינות או להתייעץ?
                                        </p>
                                        <h3 className="font-bold text-lg">
                                            דברי איתי כאן, אני זמינה 👇
                                        </h3>
                                    </div>

                                    {/* רכיב הצ'אט שלנו נכנס כאן */}
                                    <div className="flex-1 bg-gray-50 relative">
                                        <ChatInterface
                                            businessConfig={clientData}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === SOCIAL PROOF: המלצות === */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            לקוחות מספרות
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                                >
                                    <div className="flex text-yellow-400 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={16}
                                                fill="currentColor"
                                            />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4">
                                        "הגעתי סקפטית ויצאתי מאוהבת! השירות היה
                                        מדהים, הצ'אט חסך לי זמן וקבעתי תור
                                        בשניות. התוצאה מושלמת."
                                    </p>
                                    <div className="font-bold text-sm">
                                        מיכל לוי, תל אביב
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* === FOOTER: פרטים קבועים === */}
                <footer className="bg-white border-t py-8 mt-12">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} /> {clientData.address}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} /> א'-ה': 09:00 - 19:00
                        </div>
                        <div>
                            © כל הזכויות שמורות ל{clientData.businessName}
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
