import Image from "next/image";
import { notFound } from "next/navigation";
import ChatInterface from "@/components/ChatInterface";
import { MapPin, Clock, Check, Star } from "lucide-react";
import { getClientBySlug } from "@/services/client-service";

async function getClientData(slug: string) {
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
            <main>
                {/* === HERO SECTION === */}
                <section className="relative pt-6 pb-12 lg:pt-16 lg:pb-24 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
                            {/* צד ימין: המיתוג של הלקוחה */}
                            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-4 z-10">
                                <div className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs md:text-sm font-medium w-fit mb-1 md:mb-2">
                                    <Star size={14} fill="currentColor" />
                                    המומלצת ביותר באזור
                                </div>

                                {/* לוגו הלקוחה */}
                                <div className="relative w-full max-w-[150px] md:max-w-[200px] h-24 md:h-32 mb-2">
                                    {clientData.logo ? (
                                        <Image
                                            src={clientData.logo}
                                            alt="Client Logo"
                                            fill
                                            className="object-contain object-right"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-pink-100 text-pink-600 rounded-full text-2xl md:text-3xl font-bold">
                                            {clientData.businessName.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-lg md:text-xl font-medium text-gray-500 tracking-wide">
                                    ברוכה הבאה ל...
                                </h2>

                                <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold leading-[1.1] text-gray-900">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                                        {clientData.businessName}
                                    </span>
                                </h1>

                                <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-lg mt-2 md:mt-4">
                                    אנו שמחים לארח אותך. הצוות שלנו כאן כדי
                                    להעניק לך את הטיפול המסור והמקצועי ביותר.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 pt-4 md:pt-6">
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

                            {/* צד שמאל: הווידג'ט (הצ'אט) */}
                            <div
                                className="w-full lg:w-1/2 flex justify-center lg:justify-end relative mt-6 lg:mt-0"
                                id="booking"
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-100/50 to-pink-100/50 rounded-full blur-3xl -z-10"></div>

                                <div className="w-full max-w-md bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden h-[550px] md:h-[600px] flex flex-col relative z-20">
                                    <div className="bg-gray-900 text-white p-3 md:p-4 text-center shrink-0">
                                        <p className="text-xs md:text-sm opacity-80">
                                            רוצה לקבוע תור או להתייעץ?
                                        </p>
                                        <h3 className="font-bold text-base md:text-lg">
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

                {/* Footer */}
                <footer className="bg-white border-t py-6 md:py-8 mt-8 md:mt-12">
                    <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} /> {clientData.address}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} /> א'-ה': 09:00 - 19:00
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
                            <span className="text-xs font-semibold tracking-wider uppercase">
                                Powered By
                            </span>
                            <div className="relative w-16 h-6 md:w-20 md:h-8">
                                <Image
                                    src="/logo.png"
                                    alt="FOZ"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
