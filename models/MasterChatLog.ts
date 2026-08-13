import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMasterChatLog extends Document {
    business_id: Types.ObjectId;
    sessionId: string;
    transcript: string;
    createdAt: Date;
    updatedAt: Date;
}

const MasterChatLogSchema = new Schema(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        sessionId: { type: String, required: true },
        transcript: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.models.MasterChatLog || mongoose.model<IMasterChatLog>("MasterChatLog", MasterChatLogSchema);
