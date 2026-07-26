import { notFound } from "next/navigation";
import DanielaAvatar from "@/components/DanielaAvatar";
import UnifiedChatWidget from "@/components/chat/UnifiedChatWidget";
import BrandingAnchor from "@/components/BrandingAnchor";
import { getClientBySlug } from "@/services/client-service";
import {
    ArrowRight,
    MapPin,
    Phone,
    Instagram,
    Facebook,
    Globe,
    Calendar,
    Clock,
    Star,
    MessageSquare,
} from "lucide-react";
import DanielaHeader from "@/components/DanielaHeader";
import ClientLogo from "@/components/ClientLogo";
import { BACKGROUND_PRESETS } from "@/lib/background-presets";

export const dynamic = "force-dynamic";
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
                hero_subtitle:
                    "העסק המובילה לטיפולי אנטי-אייג'ינג ואסתטיקה מתקדמת.",
                features: [
                    "טכנולוגיה מתקדמת",
                    "חומרים טבעיים",
                    "ליווי אישי",
                    "תוצאות מוכחות",
                ],
            },
        };
    }
    const client = await getClientBySlug(slug);
    if (!client) return null;
    return {
        _id: client._id,
        businessName: client.businessName,
        ownerName: client.ownerName,
        phone: client.phone || "לא צוין",
        address: client.address || "כתובת העסק",
        domainGuidelines: client.domainGuidelines,
        tone: "יוקרתי ומקצועי",
        isDemo: false,
        logo: client.logo || null,
        heroImage:
            "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop",
        landing_page_data: client.landing_page_data || {},
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
    const heroSubtitle =
        landing_page_data?.hero_subtitle || "המומחים לאסתטיקה ויופי";
    const heroImage = landing_page_data?.hero_image_url || clientData.logo;
    const description = landing_page_data?.about_text || heroSubtitle;

    // Background & Theme Logic
    const savedId = landing_page_data?.background_style || "misty-rose";
    const customImage = landing_page_data?.custom_background_image;
    const preset =
        BACKGROUND_PRESETS.find((p) => p.id === savedId) ||
        BACKGROUND_PRESETS[0];

    // Default Theme Colors (fallback to preset or defaults)
    let themeTextColor = preset.themeTextColor || "#374151";
    let themeAccentColor = preset.themeAccentColor || "#be185d";

    // Define Style
    let pageStyle: React.CSSProperties = {
        color: themeTextColor,
        transition: "all 0.5s ease",
    };

    if (savedId === "custom" && customImage) {
        // Logic for Custom Image: Force White Text + Dark Overlay
        themeTextColor = "#ffffff";
        pageStyle = {
            ...pageStyle,
            color: themeTextColor,
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${customImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
        };
    } else if (preset) {
        pageStyle = {
            ...pageStyle,
            background: preset.cssValue,
            backgroundSize: preset.backgroundSize || "cover",
            backgroundRepeat: "no-repeat",
        };
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 lg:p-8 transition-all duration-500"
            style={pageStyle}
            dir="rtl"
        >
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* === COLUMN 1: BUSINESS INFO === */}
                <div className="flex flex-col justify-start space-y-6 lg:pt-8">
                    {/* Header Row: Logo & Text */}
                    <div className="flex flex-row items-center gap-4">
                        {/* Logo / Hero Image */}
                        <div className="relative w-32 h-32 shrink-0">
                            <ClientLogo
                                src={heroImage}
                                businessName={clientData.businessName}
                            />
                        </div>

                        {/* Business Name & Description */}
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                {heroTitle}
                            </h1>
                            <p className="text-lg leading-relaxed max-w-lg opacity-90">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Standalone Avatar */}
                    <DanielaAvatar />

                    {/* Optional Action Buttons / Info */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        {phone && (
                            <a
                                href={`tel:${phone}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Phone
                                    size={16}
                                    style={{ color: themeAccentColor }}
                                />
                                <span className="text-sm font-medium">
                                    {phone}
                                </span>
                            </a>
                        )}
                        {address && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm">
                                <MapPin
                                    size={16}
                                    style={{ color: themeAccentColor }}
                                />
                                <span className="text-sm font-medium">
                                    {address}
                                </span>
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
                        <div className="flex-1 relative bg-transparent flex flex-col overflow-hidden min-h-0">
                            <BrandingAnchor
                                context="consumer"
                                businessData={clientData}
                            />
                            <UnifiedChatWidget
                                key={clientData._id.toString()}
                                mode="public"
                                variant="embedded"
                                businessConfig={clientData}
                                initialMessages={[
                                    {
                                        role: "assistant",
                                        content: `היי! אני דניאלה, העוזרת החכמה של ${clientData.businessName}. איך אני יכולה לעזור לך היום? ✨`,
                                    },
                                ]}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
