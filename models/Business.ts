import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IBusiness extends Document {
    slug: string;
    businessName: string;
    ownerName: string;
    ownerEmail: string;
    password?: string;
    phone?: string;
    address?: string;
    logo?: string;
    role?: "admin" | "user";
    api_keys?: {
        simplybook?: {
            companyLogin?: string;
            apiKey?: string;
        };
        whatsapp?: string;
    };
    ai_settings?: {
        onboarding_status: "new" | "in_progress" | "completed";
        tone: string;
        language: string;
        manager_name?: string;
        manager_gender?: "female" | "male";
    };
    operational_settings?: {
        opening_hours: Map<string, string>;
        services: string[];
        timezone: string;
    };
    landing_page_data?: {
        hero_title?: string;
        hero_subtitle?: string;
        hero_image_url?: string;
        about_text?: string;
        features?: string[];
        primary_color?: string;
        background_style?: string;
        custom_background_image?: string;
    };
    subscriptionStatus: "active" | "trial" | "expired";
    lastImageGeneratedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
    {
        // --- Identity ---
        slug: { type: String, required: true, unique: true },
        businessName: { type: String, required: true },
        ownerName: { type: String, required: true },
        ownerEmail: { type: String, required: true, unique: true },
        password: { type: String, required: false }, // Encrypted, optional for OAuth users
        phone: { type: String },
        address: { type: String },
        logo: { type: String },
        role: { type: String, enum: ["admin", "user"], default: "user" },

        // --- Config ---
        api_keys: {
            simplybook: {
                companyLogin: { type: String },
                apiKey: { type: String },
                userLogin: { type: String },
                userPassword: { type: String }
            },
            whatsapp: { type: String },
        },

        // --- AI Settings ---
        ai_settings: {
            onboarding_status: {
                type: String,
                enum: ["new", "in_progress", "completed"],
                default: "new"
            },
            tone: { type: String, default: "Professional" },
            language: { type: String, default: "he" },
            manager_name: { type: String, default: "Golda" },
            manager_gender: { type: String, enum: ["female", "male"], default: "female" },
        },

        // --- Operational ---
        operational_settings: {
            opening_hours: { type: Map, of: String, default: {} },
            services: [{ type: String }],
            timezone: { type: String, default: "Asia/Jerusalem" },
        },

        // --- Landing Page Content (CMS) ---
        landing_page_data: {
            hero_title: { type: String, default: "" },
            hero_subtitle: { type: String, default: "" },
            hero_image_url: { type: String, default: "" },
            about_text: { type: String, default: "" },
            features: { type: [String], default: [] },
            primary_color: { type: String, default: "" },
            background_style: { type: String, default: "soft-rose" },
            custom_background_image: { type: String, default: "" }
        },

        subscriptionStatus: {
            type: String,
            enum: ["active", "trial", "expired"],
            default: "trial"
        },
        lastImageGeneratedAt: { type: Date },
    },
    { timestamps: true }
);

const Business = models.Business || model<IBusiness>("Business", BusinessSchema);

export default Business;
