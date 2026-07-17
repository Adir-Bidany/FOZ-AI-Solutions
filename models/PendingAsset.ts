import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPendingAsset extends Document {
    businessId: Types.ObjectId;
    agentName: "Michal" | "Roi" | "Golda";
    type: string;
    title: string;
    content: string;
    status: "pending" | "approved" | "rejected";
    goldaFeedback?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PendingAssetSchema = new Schema(
    {
        businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        agentName: { type: String, enum: ["Michal", "Roi", "Golda"], required: true },
        type: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        goldaFeedback: { type: String },
    },
    { timestamps: true }
);

export default mongoose.models.PendingAsset || mongoose.model<IPendingAsset>("PendingAsset", PendingAssetSchema);
