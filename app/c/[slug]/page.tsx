import Image from "next/image";
import { notFound } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import { MapPin, Clock, Check, Star } from "lucide-react";
// שימ לב: לא מייבאים לפה יותר את SystemHeader
import { getClientBySlug } from "@/services/client-service";

async function getClientData(slug: string) {
    // --- אותו קוד שליפה בדיוק כמו קודם ---
    if (slug === "demo") {
        return {
            businessName: "קליניקת הדגמה (FOZ)",
            ownerName: "צוות FOZ",
            phone: "050-0000000",
            address: "מתחם ההייטק, תל אביב",
            domainGuidelines: "זוהי קליניקת הדגמה.",
            tone: "מכירתי ומקצועי",
            isDemo: true,
            logo: "/logo.png",
            heroImage:
                "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop",
        };
    }
    const client = await getClientBySlug(slug);
    if (!client) return null;
    return {
        businessName: client.businessName,
        ownerName: client.ownerName,
        phone: client.phone || "לא צוין",
        address: client.address || "כתובת הקליניקה",
        domainGuidelines: client.domainGuidelines,
        tone: "יוקרתי ומקצועי",
        isDemo: false,
        logo: client.logo || null,
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

    if (!clientData) return notFound();

    return (
        <div className="bg-white text-gray-900" dir="rtl">
            {/* מחקנו את SystemHeader מכאן כי הוא ב-layout */}

            <main>
                {/* === HERO SECTION === */}
                <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
                            {/* צד ימין: המיתוג של הלקוחה */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-4 z-10">
                                <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium w-fit mb-2">
                                    <Star size={14} fill="currentColor" />
                                    המומלצת ביותר באזור
                                </div>

                                {/* לוגו הלקוחה - מודגש כאן */}
                                <div className="relative w-full max-w-[200px] h-32 mb-2">
                                    {clientData.logo ? (
                                        <Image
                                            src={clientData.logo}
                                            alt="Client Logo"
                                            fill
                                            className="object-contain object-right"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-20 h-20 bg-pink-100 text-pink-600 rounded-full text-3xl font-bold">
                                            {clientData.businessName.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-medium text-gray-500 tracking-wide">
                                    ברוכה הבאה ל...
                                </h2>

                                <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] text-gray-900">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                                        {clientData.businessName}
                                    </span>
                                </h1>
                                {/* ... שאר הקוד נשאר זהה ... */}
                                <p className="text-lg text-gray-600 leading-relaxed max-w-lg mt-4">
                                    אנו שמחים לארח אותך. הצוות שלנו כאן כדי
                                    להעניק לך את הטיפול המסור והמקצועי ביותר.
                                </p>
                                {/* ... המשך הקוד המקורי שלך ... */}
                            </div>

                            {/* צד שמאל: הצ'אט (ChatInterface) ... */}
                            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative mt-8 lg:mt-0">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-100/50 to-pink-100/50 rounded-full blur-3xl -z-10"></div>
                                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden h-[600px] flex flex-col relative z-20">
                                    <div className="bg-gray-900 text-white p-4 text-center shrink-0">
                                        <p className="text-sm opacity-80">
                                            רוצה לקבוע תור או להתייעץ?
                                        </p>
                                        <h3 className="font-bold text-lg">
                                            אנחנו זמינים כאן 👇
                                        </h3>
                                    </div>
                                    <div className="flex-1 bg-gray-50 relative overflow-hidden">
                                        <ChatInterface
                                            businessConfig={clientData}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Footer וכו' נשארים אותו דבר */}
            </main>
        </div>
    );
}
