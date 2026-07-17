import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMichalDataStore extends Document {
    businessId: Types.ObjectId;
    sourceSessionId: string;
    extractedContext: string;
    processed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MichalDataStoreSchema = new Schema(
    {
        businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        sourceSessionId: { type: String, required: true },
        extractedContext: { type: String, required: true },
        processed: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.models.MichalDataStore || mongoose.model<IMichalDataStore>("MichalDataStore", MichalDataStoreSchema);
