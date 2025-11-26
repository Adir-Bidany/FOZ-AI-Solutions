import SystemHeader from "@/components/SystemHeader";
import SystemFooter from "@/components/SystemFooter";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <SystemHeader />
            <main className="flex-1">{children}</main>
            <SystemFooter />
        </div>
    );
}
