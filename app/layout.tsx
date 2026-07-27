import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
// מחקנו את SystemHeader ואת SystemFooter מכאן!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "FOZ AI Solutions",
    description: "Automated AI Chat for Clinics",
    icons: { icon: "/favicon.png" },
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="he" dir="rtl" suppressHydrationWarning>
            <body className={`${inter.className} bg-background text-foreground min-h-screen antialiased`}>
                <Providers>
                    {children}
                    <Toaster />
                </Providers>
            </body>
        </html>
    );
}
