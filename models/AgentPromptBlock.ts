import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IAgentPromptBlock extends Document {
    key_identifier: string;
    target_scope: "GLOBAL" | "PAZ" | "DANIELA" | "GOLDA";
    topic_title: string;
    content: string;
    is_active: boolean;
    sort_order: number;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AgentPromptBlockSchema = new Schema<IAgentPromptBlock>(
    {
        key_identifier: { type: String, required: true, unique: true, index: true },
        target_scope: {
            type: String,
            enum: ["GLOBAL", "PAZ", "DANIELA", "GOLDA"],
            required: true,
            index: true,
        },
        topic_title: { type: String, required: true },
        content: { type: String, required: true },
        is_active: { type: Boolean, default: true, index: true },
        sort_order: { type: Number, default: 0 },
        description: { type: String, default: "" },
    },
    { timestamps: true }
);

const AgentPromptBlock =
    models.AgentPromptBlock ||
    model<IAgentPromptBlock>("AgentPromptBlock", AgentPromptBlockSchema);

export default AgentPromptBlock;
