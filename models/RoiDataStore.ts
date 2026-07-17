import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRoiDataStore extends Document {
    businessId: Types.ObjectId;
    sourceSessionId: string;
    extractedContext: string;
    processed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoiDataStoreSchema = new Schema(
    {
        businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        sourceSessionId: { type: String, required: true },
        extractedContext: { type: String, required: true },
        processed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.RoiDataStore || mongoose.model<IRoiDataStore>("RoiDataStore", RoiDataStoreSchema);
