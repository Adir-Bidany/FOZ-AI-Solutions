import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IInsightsLog extends Document {
    business_id: Types.ObjectId;
    agent_persona: "michal" | "roi";
    date: Date;
    summary: string;
    metrics?: Record<string, any>;
    createdAt: Date;
}

const InsightsLogSchema = new Schema<IInsightsLog>(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        agent_persona: {
            type: String,
            enum: ["michal", "roi"],
            required: true
        },
        date: { type: Date, default: Date.now },
        summary: { type: String, required: true },
        metrics: { type: Map, of: Schema.Types.Mixed },
    },
    { timestamps: true }
);

const InsightsLog = models.InsightsLog || model<IInsightsLog>("InsightsLog", InsightsLogSchema);

export default InsightsLog;
