import { notFound } from "next/navigation";
import UnifiedChatWidget from "@/components/chat/UnifiedChatWidget";
import BrandingAnchor from "@/components/BrandingAnchor";
import { getClientBySlug } from "@/services/client-service";
import { RESERVED_SLUGS } from "@/lib/constants/reserved-slugs";
import { MapPin } from "lucide-react";
import DanielaHeader from "@/components/DanielaHeader";
import ClientLogo from "@/components/ClientLogo";
import ThemeToggle from "@/components/ThemeToggle";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ClientPortalWrapper from "@/components/client-portal/ClientPortalWrapper";
import BusinessPolicies from "@/components/landing/BusinessPolicies";

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
        policies: client.policies || [],
    };
}

export default async function ClientPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Safety Intercept: Protect core platform routes
    if (RESERVED_SLUGS.has(slug.toLowerCase())) {
        return notFound();
    }

    const clientData = await getClientData(slug);
    if (!clientData) return notFound();

    const { landing_page_data, address } = clientData;
    const heroTitle = landing_page_data?.hero_title || clientData.businessName;
    const description = landing_page_data?.hero_subtitle || landing_page_data?.about_text || "";
    const heroImage = clientData.logo || landing_page_data?.hero_image_url || null;

    // --- CONSUMER AUTHENTICATION CHECK ---
    const cookieStore = await cookies();
    const token = cookieStore.get("consumer_token")?.value;
    let loggedInCustomerId: string | null = null;
    let loggedInCustomerName = "";

    if (token) {
        try {
            const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret_foz_ai";
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            // Strict Tenancy: Only allow if token belongs to THIS business
            if (decoded.businessId === clientData._id.toString()) {
                loggedInCustomerId = decoded.customerId;
                loggedInCustomerName = decoded.customerName || "לקוח";
            }
        } catch (err) {
            // Invalid or expired token
        }
    }

    const isConsumerMode = !!loggedInCustomerId;

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-between bg-background text-foreground transition-colors duration-300 relative"
            dir="rtl"
            suppressHydrationWarning
        >
            {/* --- TOP HEADER BAR --- */}
            <header suppressHydrationWarning className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all text-foreground shrink-0 mb-8 md:mb-12">
                <div className="max-w-6xl mx-auto px-4 md:px-6 min-h-24 md:min-h-28 py-2 flex items-center justify-between relative">
                    <div />
                    <span className="absolute left-1/2 -translate-x-1/2 font-bold text-lg md:text-xl truncate text-foreground pointer-events-none">
                        {clientData.businessName}
                    </span>
                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <ThemeToggle />
                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 flex items-center justify-center overflow-hidden">
                            <ClientLogo src={heroImage} businessName={clientData.businessName} />
                        </div>
                    </div>
                </div>
            </header>

            {/* --- MAIN CONTENT SECTION --- */}
            <main suppressHydrationWarning className="w-full max-w-6xl flex-1 px-4 lg:px-0">
                {isConsumerMode ? (
                    // --- CLIENT PORTAL (LOGGED IN) ---
                    <ClientPortalWrapper 
                        customerName={loggedInCustomerName}
                        businessConfig={clientData} 
                    />
                ) : (
                    // --- GUEST VIEW (NOT LOGGED IN) ---
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start pb-20">
                        <div className="flex flex-col justify-start text-center lg:text-right items-center lg:items-start space-y-4 lg:pt-2">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground tracking-tight">
                                {heroTitle}
                            </h1>
                            {description && (
                                <p className="text-lg md:text-xl leading-relaxed max-w-xl text-muted-foreground">
                                    {description}
                                </p>
                            )}
                            {address && (
                                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-card/90 border border-border/80 rounded-full text-foreground shadow-sm backdrop-blur-md">
                                        <MapPin size={16} className="text-primary" />
                                        <span className="text-sm font-medium">{address}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-full flex justify-center lg:justify-end">
                            <div className="w-full max-w-md h-[70dvh] min-h-[420px] bg-card/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_0_100px_rgba(255,255,255,0.35)] overflow-hidden relative flex flex-col border border-border/60 dark:border-white/10">
                                <DanielaHeader businessName={clientData.businessName} logoUrl={heroImage} />
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
                    </div>
                )}
                
                {/* Render Business Policies for Guests */}
                {!isConsumerMode && clientData.policies && clientData.policies.length > 0 && (
                    <BusinessPolicies policies={clientData.policies} />
                )}
            </main>

            <BrandingAnchor
                context="consumer"
                businessData={clientData}
            />
        </div>
    );
}
