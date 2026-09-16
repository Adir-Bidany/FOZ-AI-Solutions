import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ISystemSettings extends Document {
    pricing: {
        basic: number;
        pro: number;
        enterprise: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
    {
        pricing: {
            basic: { type: Number, default: 149 },
            pro: { type: Number, default: 299 },
            enterprise: { type: Number, default: 599 },
        },
    },
    { timestamps: true }
);

const SystemSettings = models.SystemSettings || model<ISystemSettings>("SystemSettings", SystemSettingsSchema);

export default SystemSettings;