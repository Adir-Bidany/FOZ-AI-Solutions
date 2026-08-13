import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IAgentInsight extends Document {
    business_id: Types.ObjectId;
    agentName: string;
    type: string; // e.g., 'social_post', 'marketing_tip', 'financial_report', 'budget_analysis'
    title: string;
    content: string;
    imageUrl?: string;
    status: "draft" | "approved" | "archived" | "pending";
    createdAt: Date;
    updatedAt: Date;
}

const AgentInsightSchema = new Schema<IAgentInsight>(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        agentName: { type: String, required: true, default: "Golda" },
        type: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String, required: true },
        imageUrl: { type: String },
        status: { type: String, enum: ["draft", "approved", "archived", "pending"], default: "draft" },
    },
    { timestamps: true }
);

const AgentInsight = models.AgentInsight || model<IAgentInsight>("AgentInsight", AgentInsightSchema);

export default AgentInsight;
