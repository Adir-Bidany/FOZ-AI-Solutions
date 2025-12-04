import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface ICustomer extends Document {
    businessId: Types.ObjectId;
    phone: string;
    name?: string;
    email?: string;

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

    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        phone: { type: String, required: true },
        name: { type: String },
        email: { type: String },

        // AI Profile (v3.0)
        ai_profile: {
            summary: { type: String },
            churn_risk_score: { type: Number, min: 0, max: 100 },
            ltv_prediction: { type: Number },
            marketing_tags: [{ type: String }],
        },

        notes: { type: String },
        tags: [{ type: String }],
    },
    { timestamps: true }
);

// Ensure phone is unique per business
CustomerSchema.index({ businessId: 1, phone: 1 }, { unique: true });

const Customer = models.Customer || model<ICustomer>("Customer", CustomerSchema);

export default Customer;
