import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "FOZ AI Solutions",
        short_name: "FOZ",
        description: "Automated AI Chat for Clinics",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#09090b",
        icons: [
            {
                src: "/favicon.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/favicon.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
