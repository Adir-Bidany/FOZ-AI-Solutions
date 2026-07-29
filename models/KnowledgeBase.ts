import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IService {
    name: string;
    price: number;
    duration?: number; // in minutes
    description?: string;
}

export interface IKnowledgeItem {
    key: string;
    content: string;
    visibility: "public_daniela" | "internal_golda";
}

export interface IKnowledgeBase extends Document {
    tenant_id: Types.ObjectId; // Renamed from businessId to match SaaS architecture
    services: IService[];
    businessHours: string; // Free text or structured
    publicInstructions?: string; // Information for Daniela (public chat)
    internalNotes?: string;      // Private internal strategy for Golda
    faqs: Array<{ question: string; answer: string; visibility?: "public_daniela" | "internal_golda" }>;
    knowledgeItems?: IKnowledgeItem[];
    createdAt: Date;
    updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    duration: { type: Number },
    description: { type: String },
});

const KnowledgeBaseSchema = new Schema<IKnowledgeBase>(
    {
        tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, unique: true },
        services: [ServiceSchema],
        businessHours: { type: String, default: "09:00 - 18:00" },
        publicInstructions: { type: String, default: "" },
        internalNotes: { type: String, default: "" },
        faqs: [
            {
                question: { type: String, required: true },
                answer: { type: String, required: true },
                visibility: { type: String, enum: ["public_daniela", "internal_golda"], default: "public_daniela" },
            },
        ],
        knowledgeItems: [
            {
                key: { type: String, required: true },
                content: { type: String, required: true },
                visibility: { type: String, enum: ["public_daniela", "internal_golda"], default: "public_daniela" },
            },
        ],
    },
    { timestamps: true }
);

const KnowledgeBase = models.KnowledgeBase || model<IKnowledgeBase>("KnowledgeBase", KnowledgeBaseSchema);

export default KnowledgeBase;
