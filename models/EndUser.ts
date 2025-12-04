import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// --- EndUser (Customer) Schema ---
export interface IEndUser extends Document {
    tenant_id: Types.ObjectId;
    auth_info: {
        phone: string; // Primary Key in Israel
        email?: string;
        google_id?: string;
        otp_secret?: string; // For OTP auth
    };
    profile: {
        name?: string;
        preferences?: Map<string, string>;
        notes?: string;
    };
    metrics: {
        last_visit?: Date;
        total_spend: number;
        visit_count: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const EndUserSchema = new Schema<IEndUser>(
    {
        tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
        auth_info: {
            phone: { type: String, required: true },
            email: { type: String },
            google_id: { type: String },
            otp_secret: { type: String, select: false },
        },
        profile: {
            name: { type: String },
            preferences: { type: Map, of: String },
            notes: { type: String },
        },
        metrics: {
            last_visit: { type: Date },
            total_spend: { type: Number, default: 0 },
            visit_count: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

// Compound index to ensure unique phone per tenant
EndUserSchema.index({ tenant_id: 1, "auth_info.phone": 1 }, { unique: true });

const EndUser = models.EndUser || model<IEndUser>("EndUser", EndUserSchema);

export default EndUser;
