import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IWaitlist extends Document {
    business_id: Types.ObjectId;
    user_id?: Types.ObjectId;       // Linked Customer doc (optional for guest entries)

    customer_name: string;          // Display name for owner dashboard
    customer_phone?: string;        // For notification via WhatsApp / SMS

    preferred_service?: string;     // Treatment/service they're waiting for
    preferred_dates?: string[];     // ISO date strings: ["2026-09-25", "2026-09-26"]
    preferred_time_of_day?: "morning" | "afternoon" | "evening" | "any";
    note?: string;                  // Free-text note from the customer

    status: "waiting" | "notified" | "booked" | "removed";
    notified_at?: Date;             // When the business notified the customer

    createdAt: Date;
    updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const WaitlistSchema = new Schema<IWaitlist>(
    {
        business_id: {
            type: Schema.Types.ObjectId,
            ref: "Business",
            required: true,
            index: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "Customer",
        },

        customer_name: {
            type: String,
            required: true,
        },
        customer_phone: {
            type: String,
        },

        preferred_service: {
            type: String,
        },
        preferred_dates: {
            type: [String],
            default: [],
        },
        preferred_time_of_day: {
            type: String,
            enum: ["morning", "afternoon", "evening", "any"],
            default: "any",
        },
        note: {
            type: String,
        },

        status: {
            type: String,
            enum: ["waiting", "notified", "booked", "removed"],
            default: "waiting",
        },
        notified_at: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Compound index to prevent duplicate entries per customer per business
WaitlistSchema.index({ business_id: 1, user_id: 1 }, { sparse: true });
WaitlistSchema.index({ business_id: 1, customer_phone: 1 }, { sparse: true });

// ─── Model ────────────────────────────────────────────────────────────────────

const Waitlist = models.Waitlist || model<IWaitlist>("Waitlist", WaitlistSchema);

export default Waitlist;
