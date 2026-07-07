import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// --- Appointment Schema ---
export interface IAppointment extends Document {
    tenant_id: Types.ObjectId;
    user_id: Types.ObjectId; // Customer
    service_id?: string; // ID from KnowledgeBase or external system

    details: {
        date: Date;
        duration_minutes: number;
        service_name: string;
        price?: number;
    };

    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";

    metadata?: {
        source: "chat" | "manual" | "external";
        notes?: string;
    };

    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
        user_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
        service_id: { type: String },

        details: {
            date: { type: Date, required: true },
            duration_minutes: { type: Number, default: 30 },
            service_name: { type: String, required: true },
            price: { type: Number },
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
            default: "pending"
        },

        metadata: {
            source: { type: String, enum: ["chat", "manual", "external"], default: "chat" },
            notes: { type: String },
        },
    },
    { timestamps: true }
);

const Appointment = models.Appointment || model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
