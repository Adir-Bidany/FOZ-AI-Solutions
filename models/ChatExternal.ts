import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IMessage {
    role: "user" | "model";
    parts: { text: string }[];
    timestamp: Date;
}

export interface IChatExternal extends Document {
    business_id: Types.ObjectId;
    customer_id?: Types.ObjectId; // Optional if anonymous
    messages: IMessage[];
    processed_for_insights: boolean;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ChatExternalSchema = new Schema<IChatExternal>(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        customer_id: { type: Schema.Types.ObjectId, ref: "Customer" },
        messages: [
            {
                role: { type: String, enum: ["user", "model"], required: true },
                parts: [{ text: { type: String } }],
                timestamp: { type: Date, default: Date.now },
            },
        ],
        processed_for_insights: { type: Boolean, default: false },
        usage: {
            prompt_tokens: { type: Number, default: 0 },
            completion_tokens: { type: Number, default: 0 },
            total_tokens: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

const ChatExternal = models.ChatExternal || model<IChatExternal>("ChatExternal", ChatExternalSchema);

export default ChatExternal;
