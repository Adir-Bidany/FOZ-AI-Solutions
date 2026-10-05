import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ICustomer extends Document {
    business_id: Types.ObjectId;
    phone: string;
    name: string;
    lastName: string;
    email: string;
    passwordHash: string;
    status: "pending" | "approved";
    metrics: {
        totalRevenue: number;
        totalAppointments: number;
    };
    history: {
        lastTreatments: string[];
    };
    // AI Profile (v3.0)
    ai_profile?: {
        summary?: string;
        churn_risk_score?: number;
        ltv_prediction?: number;
        marketing_tags?: string[];
    };

    // Legacy / Other
    notes?: string;
    tags?: string[];
    pipeline_status?: "New" | "Contacted" | "Meeting Set" | "Closed";
    
    pushSubscriptions?: {
        endpoint: string;
        keys: {
            p256dh: string;
            auth: string;
        };
    }[];

    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        phone: { type: String, required: true },
        name: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved"], default: "pending" },
        metrics: {
            totalRevenue: { type: Number, default: 0 },
            totalAppointments: { type: Number, default: 0 }
        },
        history: {
            lastTreatments: [{ type: String }]
        },

        // AI Profile (v3.0)
        ai_profile: {
            summary: { type: String },
            churn_risk_score: { type: Number, min: 0, max: 100 },
            ltv_prediction: { type: Number },
            marketing_tags: [{ type: String }],
        },

        notes: { type: String },
        tags: [{ type: String }],
        pipeline_status: { type: String, enum: ["New", "Contacted", "Meeting Set", "Closed"], default: "New" },
        
        pushSubscriptions: {
            type: [
                {
                    endpoint: { type: String, required: true },
                    keys: {
                        p256dh: { type: String, required: true },
                        auth: { type: String, required: true },
                    }
                }
            ],
            default: []
        },
    },
    { timestamps: true }
);

// Ensure phone is unique per business
CustomerSchema.index({ business_id: 1, phone: 1 }, { unique: true });

const Customer = models.Customer || model<ICustomer>("Customer", CustomerSchema);

export default Customer;
