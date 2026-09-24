import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

const heebo = Heebo({ 
    subsets: ["latin", "hebrew"],
    variable: "--font-heebo",
    weight: ["300", "400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
    title: "FOZ AI Solutions",
    description: "Automated AI Chat for Clinics",
    icons: { 
        icon: "/favicon.png",
        apple: "/favicon.png" 
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#09090b" }
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="he" dir="rtl" suppressHydrationWarning className={heebo.variable}>
            <body suppressHydrationWarning className={`${heebo.className} bg-background text-foreground min-h-screen antialiased font-sans`}>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
