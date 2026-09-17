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
    };
    subscriptionStatus: "active" | "trial" | "expired";
    account_status?: "active" | "suspended" | "trial";
    subscription_tier?: "basic" | "pro" | "enterprise";
    ai_token_quota?: number;
    /** ISO date — when the 14-day free trial expires. Null means no trial (manual/paid account). */
    trial_ends_at?: Date;
    lastImageGeneratedAt?: Date;
    workingHours?: {
        day: number;       // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        isOpen: boolean;
        startTime: string; // e.g. "09:00"
        endTime: string;   // e.g. "18:00"
    }[];
    /** If true, the booking AI flow will show a service selector. If false, books a generic appointment. */
    hasServices?: boolean;
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
        account_status: {
            type: String,
            enum: ["active", "suspended", "trial"],
            default: "trial"
        },

        // --- Config ---
        api_keys: {
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
        },

        subscriptionStatus: {
            type: String,
            enum: ["active", "trial", "expired"],
            default: "trial"
        },

        subscription_tier: {
            type: String,
            enum: ["basic", "pro", "enterprise"],
            default: "enterprise"  // New businesses start on full enterprise trial
        },
        ai_token_quota: {
            type: Number,
            default: 500000
        },
        trial_ends_at: {
            type: Date,
            default: null  // Set by pre-save hook on first save
        },
        lastImageGeneratedAt: { type: Date },
        publicInstructions: { type: String, default: "" },
        internalNotes: { type: String, default: "" },

        // --- Native FOZ Calendar: Working Hours ---
        workingHours: {
            type: [
                {
                    day: { type: Number, required: true, min: 0, max: 6 },
                    isOpen: { type: Boolean, default: true },
                    startTime: { type: String, default: "09:00" },
                    endTime: { type: String, default: "18:00" },
                }
            ],
            default: [
                { day: 0, isOpen: true,  startTime: "09:00", endTime: "18:00" }, // Sun
                { day: 1, isOpen: true,  startTime: "09:00", endTime: "18:00" }, // Mon
                { day: 2, isOpen: true,  startTime: "09:00", endTime: "18:00" }, // Tue
                { day: 3, isOpen: true,  startTime: "09:00", endTime: "18:00" }, // Wed
                { day: 4, isOpen: true,  startTime: "09:00", endTime: "18:00" }, // Thu
                { day: 5, isOpen: true,  startTime: "09:00", endTime: "13:00" }, // Fri
                { day: 6, isOpen: false, startTime: "09:00", endTime: "18:00" }, // Sat
            ]
        },
        hasServices: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
// Automatically set trial_ends_at to 14 days from creation for new businesses.
BusinessSchema.pre("save", async function () {
    if (this.isNew && !this.trial_ends_at) {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        this.trial_ends_at = trialEndDate;
    }
});

const Business = models.Business || model<IBusiness>("Business", BusinessSchema);

export default Business;
