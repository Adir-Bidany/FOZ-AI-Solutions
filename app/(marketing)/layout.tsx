import SystemHeader from "@/components/SystemHeader";
import SystemFooter from "@/components/SystemFooter";
import BrandingAnchor from "@/components/BrandingAnchor";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <SystemHeader />
            <BrandingAnchor context="platform" />
            <main className="flex-1">{children}</main>
            <SystemFooter />
        </div>
    );
}
