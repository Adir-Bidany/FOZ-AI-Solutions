import { notFound } from "next/navigation";
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
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getClientData(slug: string) {
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
    const heroSubtitle = landing_page_data?.hero_subtitle || "";
    const heroImage = clientData.logo || landing_page_data?.hero_image_url || null;
    const description = landing_page_data?.hero_subtitle || landing_page_data?.about_text || "";

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-between bg-background text-foreground transition-colors duration-300 relative"
            dir="rtl"
            suppressHydrationWarning
        >
            {/* --- TOP HEADER BAR (Dashboard Header Style) --- */}
            <header suppressHydrationWarning className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all text-foreground shrink-0 mb-8 md:mb-12">
                <div className="max-w-6xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
                    {/* Right Side (RTL Start): Logo + Business Name */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-muted/20 border border-border/40 p-0.5">
                            <ClientLogo src={heroImage} businessName={clientData.businessName} />
                        </div>
                        <span className="font-bold text-lg md:text-xl truncate text-foreground">
                            {clientData.businessName}
                        </span>
                    </div>

                    {/* Left Side (RTL End): Divider + Theme Toggle */}
                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <div className="h-6 w-px bg-border/80 hidden sm:block" />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT SECTION --- */}
            <main suppressHydrationWarning className="w-full max-w-6xl flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* Right Column (Desktop) / Top Section (Mobile): Title + Subtitle */}
                <div className="flex flex-col justify-start text-center lg:text-right items-center lg:items-start space-y-4 lg:pt-2">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground tracking-tight">
                        {heroTitle}
                    </h1>
                    {description && (
                        <p className="text-lg md:text-xl leading-relaxed max-w-xl text-muted-foreground">
                            {description}
                        </p>
                    )}

                    {/* Contact Chips */}
                    {(phone || address) && (
                        <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-card/90 border border-border/80 rounded-full text-foreground hover:bg-accent transition-colors shadow-sm backdrop-blur-md"
                                >
                                    <Phone size={16} className="text-primary" />
                                    <span className="text-sm font-medium">{phone}</span>
                                </a>
                            )}
                            {address && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-card/90 border border-border/80 rounded-full text-foreground shadow-sm backdrop-blur-md">
                                    <MapPin size={16} className="text-primary" />
                                    <span className="text-sm font-medium">{address}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Left Column (Desktop) / Bottom Section (Mobile): Daniela's Chat Window */}
                <div className="w-full flex justify-center lg:justify-end">
                    <div className="w-full max-w-md h-[70dvh] min-h-[420px] bg-card/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(255,255,255,0.35)] overflow-hidden relative flex flex-col border border-border/60 dark:border-white/10">
                        {/* The Header */}
                        <DanielaHeader businessName={clientData.businessName} logoUrl={heroImage} />

                        {/* The Chat Body */}
                        <div className="flex-1 relative bg-transparent flex flex-col overflow-hidden min-h-0">
                            <UnifiedChatWidget
                                key={clientData._id.toString()}
                                mode="public"
                                variant="embedded"
                                businessConfig={clientData}
                                initialMessages={[
                                    {
                                        role: "assistant",
                                        content: `היי! אני דניאלה, העוזרת החכמה של ${clientData.businessName}. איך אני יכולה לעזור לך היום?`,
                                    },
                                ]}
                                className="w-full h-full"
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* Root-level Floating Navigation / Consumer Personal Area Anchor */}
            <BrandingAnchor
                context="consumer"
                businessData={clientData}
            />
        </div>
    );
}
