import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// --- Appointment Schema ---
export interface IAppointment extends Document {
    business_id: Types.ObjectId;
    user_id?: Types.ObjectId; // Customer — optional for owner-created blocks
    service_id?: string;      // ID from KnowledgeBase or external system

    /** Distinguishes a real customer booking from an owner-managed calendar block */
    type?: "booking" | "block";
    /** Short label for block entries, e.g. "Dentist", "Day Off" */
    title?: string;

    details: {
        date: Date;
        duration_minutes: number;
        service_name: string;
        price?: number;
        /** If true, the block covers the entire business day */
        is_full_day?: boolean;
    };

    status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";

    metadata?: {
        source: "chat" | "manual" | "external" | "block";
        notes?: string;
    };

    createdAt: Date;
    updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true, index: true },
        user_id: { type: Schema.Types.ObjectId, ref: "Customer" },
        service_id: { type: String },

        type: {
            type: String,
            enum: ["booking", "block"],
            default: "booking",
        },
        title: { type: String },

        details: {
            date: { type: Date, required: true },
            duration_minutes: { type: Number, default: 30 },
            service_name: { type: String, default: "" },
            price: { type: Number },
            is_full_day: { type: Boolean, default: false },
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed", "no_show"],
            default: "pending"
        },

        metadata: {
            source: { type: String, enum: ["chat", "manual", "external", "block"], default: "manual" },
            notes: { type: String },
        },
    },
    { timestamps: true }
);

const Appointment = models.Appointment || model<IAppointment>("Appointment", AppointmentSchema);

export default Appointment;
