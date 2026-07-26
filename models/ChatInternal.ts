import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IMessage {
    role: "user" | "model";
    parts: { text: string, mode?: string }[];
    timestamp: Date;
}

export interface IChatInternal extends Document {
    business_id: Types.ObjectId;
    agent_persona: "golda" | "michal" | "roi";
    messages: IMessage[];
    status: "active" | "archived";
    createdAt: Date;
    updatedAt: Date;
}

const ChatInternalSchema = new Schema<IChatInternal>(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        agent_persona: {
            type: String,
            enum: ["golda", "michal", "roi"],
            required: true
        },
        status: {
            type: String,
            enum: ["active", "archived"],
            default: "active",
            index: true
        },
        messages: [
            {
                role: { type: String, enum: ["user", "model"], required: true },
                parts: [{ text: { type: String }, mode: { type: String } }],
                timestamp: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Index to quickly find the active chat for a specific agent in a business
ChatInternalSchema.index({ business_id: 1, agent_persona: 1, status: 1 });

const ChatInternal = models.ChatInternal || model<IChatInternal>("ChatInternal", ChatInternalSchema);

export default ChatInternal;
