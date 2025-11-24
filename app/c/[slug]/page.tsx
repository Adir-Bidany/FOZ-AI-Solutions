import Image from "next/image";
import { notFound } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import { MapPin, Phone, Clock, Check, Star } from "lucide-react";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

// פונקציה לשליפת נתונים אמיתיים מה- DB וגם מצב דמו
async function getClientData(slug: string) {
    // --- מצב דמו (כאן הייתה הטעות - הוספתי את tone) ---
    if (slug === "demo") {
        return {
            businessName: "קליניקת הדגמה (FOZ)",
            ownerName: "צוות FOZ",
            phone: "050-0000000",
            address: "מתחם ההייטק, תל אביב",
            domainGuidelines:
                "זוהי קליניקת הדגמה. תפקידך להרשים את הלקוחה ביכולות שלך.",
            tone: "מכירתי ומקצועי", // <--- הנה השורה שהייתה חסרה!
            heroImage:
                "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop",
        };
    }

    await connectDB();

    const decodedSlug = decodeURIComponent(slug);
    const client = await Client.findOne({ slug: decodedSlug }).lean();

    if (!client) return null;

    // גם כאן וודא שיש את כל השדות
    return {
        businessName: client.businessName,
        ownerName: client.ownerName,
        phone: client.phone || "לא צוין",
        address: client.address || "כתובת הקליניקה",
        domainGuidelines: client.domainGuidelines || "עסק בתחום האסתטיקה",
        tone: "יוקרתי ומקצועי", // כאן זה כבר היה, אבל טוב לוודא
        heroImage:
            "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop",
    };
}

export default async function ClientPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const clientData = await getClientData(resolvedParams.slug);

    // אם לא מצאנו לקוחה כזו - מציגים שגיאה 404
    if (!clientData) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-white text-gray-900" dir="rtl">
            {/* === Header === */}
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
                {/* === HERO SECTION === */}
                <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
                            {/* צד ימין: הטקסט */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 z-10">
                                <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium w-fit">
                                    <Star size={14} fill="currentColor" />{" "}
                                    הקליניקה המובילה באזור
                                </div>

                                <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] text-gray-900">
                                    ברוכה הבאה ל<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                                        {clientData.businessName}
                                    </span>
                                </h1>

                                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                    אנו שמחים לארח אותך. הצוות שלנו כאן כדי
                                    להעניק לך את הטיפול המסור והמקצועי ביותר.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                                    {[
                                        "יחס אישי",
                                        "זמינות גבוהה",
                                        "מקצועיות",
                                        "אווירה נעימה",
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
                            </div>

                            {/* צד שמאל: הצ'אט (היומן האוטומטי) */}
                            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-100/50 to-pink-100/50 rounded-full blur-3xl -z-10"></div>

                                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden h-[600px] flex flex-col relative z-20">
                                    <div className="bg-gray-900 text-white p-4 text-center">
                                        <p className="text-sm opacity-80">
                                            רוצה לקבוע תור?
                                        </p>
                                        <h3 className="font-bold text-lg">
                                            אני {clientData.ownerName}, דברי
                                            איתי 👇
                                        </h3>
                                    </div>

                                    <div className="flex-1 bg-gray-50 relative">
                                        {/* כאן אנחנו מעבירים את הנתונים האמיתיים מה-DB לתוך הבוט! */}
                                        <ChatInterface
                                            businessConfig={clientData}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === FOOTER === */}
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
