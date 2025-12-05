import Image from "next/image";
import { notFound } from "next/navigation";
import DanielaAvatar from "@/components/DanielaAvatar";
import UnifiedChatWidget from "@/components/chat/UnifiedChatWidget";
import { getClientBySlug } from "@/services/client-service";
import { Phone, MapPin } from "lucide-react";
import DanielaHeader from "@/components/DanielaHeader";
import { BACKGROUND_PRESETS } from "@/lib/background-presets";



export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getClientData(slug: string) {
    if (slug === "demo") {
        return {
            _id: "demo",
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
            landing_page_data: {
                hero_title: "טיפולי פנים ברמה אחרת",
                hero_subtitle: "הקליניקה המובילה לטיפולי אנטי-אייג'ינג ואסתטיקה מתקדמת.",
                features: ["טכנולוגיה מתקדמת", "חומרים טבעיים", "ליווי אישי", "תוצאות מוכחות"]
            }
        };
    }
    const client = await getClientBySlug(slug);
    if (!client) return null;
    return {
        _id: client._id,
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
        landing_page_data: client.landing_page_data || {}
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

    const { landing_page_data, phone, address } = clientData;
    const heroTitle = landing_page_data?.hero_title || clientData.businessName;
    const heroSubtitle = landing_page_data?.hero_subtitle || "המומחים לאסתטיקה ויופי";
    const heroImage = landing_page_data?.hero_image_url || clientData.logo;
    const description = landing_page_data?.about_text || heroSubtitle;

    // Background Logic
    const savedId = landing_page_data?.background_style || 'misty-rose';
    const customImage = landing_page_data?.custom_background_image;

    // Find preset
    const preset = BACKGROUND_PRESETS.find(p => p.id === savedId) || BACKGROUND_PRESETS[0];

    // Define Style
    let pageStyle: React.CSSProperties = {};

    if (savedId === 'custom' && customImage) {
        pageStyle = {
            backgroundImage: `url(${customImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        };
    } else if (preset) {
        pageStyle = {
            background: preset.cssValue,
            backgroundSize: preset.backgroundSize || 'cover',
            backgroundRepeat: 'no-repeat'
        };
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 transition-all duration-500" style={pageStyle} dir="rtl">

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

                {/* === COLUMN 1: BUSINESS INFO === */}
                <div className="flex flex-col justify-start space-y-6 lg:pt-8">
                    {/* Header Row: Logo & Text */}
                    <div className="flex flex-row items-center gap-4">
                        {/* Logo / Hero Image */}
                        <div className="relative w-32 h-32 shrink-0">
                            {heroImage ? (
                                <Image
                                    src={heroImage}
                                    alt="Client Logo"
                                    fill
                                    className="object-contain object-right"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 rounded-2xl text-3xl font-bold shadow-sm">
                                    {clientData.businessName.charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Business Name & Description */}
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                                {heroTitle}
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Standalone Avatar */}
                    <DanielaAvatar />

                    {/* Optional Action Buttons / Info */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        {phone && (
                            <a href={`tel:${phone}`} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                <Phone size={16} className="text-purple-600" />
                                <span className="text-sm font-medium">{phone}</span>
                            </a>
                        )}
                        {address && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
                                <MapPin size={16} className="text-purple-600" />
                                <span className="text-sm font-medium">{address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* === COLUMN 2: THE CHAT WIDGET === */}
                <div className="w-full flex justify-center lg:justify-end">
                    <div className="w-full max-w-md h-[80vh] min-h-[600px] bg-[#0B0E14] rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 overflow-hidden relative flex flex-col">

                        {/* The Header */}
                        <DanielaHeader businessName={clientData.businessName} />

                        {/* The Chat Body */}
                        <div className="flex-1 relative bg-transparent">
                            <UnifiedChatWidget
                                mode="public"
                                variant="embedded"
                                businessConfig={clientData}
                                initialMessages={[
                                    { role: "assistant", content: `היי! אני דניאלה, העוזרת החכמה של ${clientData.businessName}. איך אני יכולה לעזור לך היום? ✨` }
                                ]}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>

            </div>
            <div className="fixed bottom-0 left-0 bg-black text-white p-2 text-xs opacity-50 z-50">
                DEBUG: Style ID = {landing_page_data?.background_style || 'undefined'}
            </div>
        </div>
    );
}
