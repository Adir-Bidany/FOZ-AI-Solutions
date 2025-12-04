import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// --- Central Event Log (AI Pipeline) ---
export interface ICentralEventLog extends Document {
    tenant_id: Types.ObjectId;
    source: "Daniela" | "System" | "External";
    target: "Golda" | "David" | "Michal" | "Roi";
    event_type: "lead_captured" | "appointment_requested" | "complaint" | "general_inquiry";

    raw_data: Record<string, any>; // The raw input/context

    status: "pending" | "processed" | "failed";
    processing_result?: string;

    createdAt: Date;
    updatedAt: Date;
}

const CentralEventLogSchema = new Schema<ICentralEventLog>(
    {
        tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        event_type: { type: String, required: true },

        raw_data: { type: Map, of: Schema.Types.Mixed },

        status: { type: String, enum: ["pending", "processed", "failed"], default: "pending" },
        processing_result: { type: String },
    },
    { timestamps: true }
);

const CentralEventLog = models.CentralEventLog || model<ICentralEventLog>("CentralEventLog", CentralEventLogSchema);

export default CentralEventLog;
