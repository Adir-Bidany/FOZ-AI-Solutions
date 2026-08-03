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
        meta?: {
            accessToken?: string;
            tokenExpiresAt?: Date;
            facebookPageId?: string;
            facebookPageName?: string;
            instagramAccountId?: string;
            instagramUsername?: string;
            isConnected?: boolean;
        };
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
    };
    subscriptionStatus: "active" | "trial" | "expired";
    lastImageGeneratedAt?: Date;
    publicInstructions?: string;
    internalNotes?: string;
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
            meta: {
                accessToken: { type: String },
                tokenExpiresAt: { type: Date },
                facebookPageId: { type: String },
                facebookPageName: { type: String },
                instagramAccountId: { type: String },
                instagramUsername: { type: String },
                isConnected: { type: Boolean, default: false },
            },
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
        },

        subscriptionStatus: {
            type: String,
            enum: ["active", "trial", "expired"],
            default: "trial"
        },
        lastImageGeneratedAt: { type: Date },
        publicInstructions: { type: String, default: "" },
        internalNotes: { type: String, default: "" },
    },
    { timestamps: true }
);

const Business = models.Business || model<IBusiness>("Business", BusinessSchema);

export default Business;
