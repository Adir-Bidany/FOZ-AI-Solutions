import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export interface IActionCard extends Document {
    business_id: Types.ObjectId;
    source_agent: "receptionist" | "marketing" | "management" | "system";
    status: "pending" | "approved" | "dismissed" | "completed" | "failed";
    priority: "low" | "medium" | "high" | "urgent";

    display_content: {
        title: string;
        description: string;
        icon?: string;
    };

    execution_payload: {
        action_type: "send_message" | "update_db" | "schedule_event" | "create_campaign" | "cancel_appointment" | "missing_info";
        params: Record<string, any>;
    };

    created_at: Date;
}

const ActionCardSchema = new Schema<IActionCard>(
    {
        business_id: { type: Schema.Types.ObjectId, ref: "Business", required: true },
        source_agent: {
            type: String,
            enum: ["receptionist", "marketing", "management", "system"],
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "dismissed", "completed", "failed"],
            default: "pending"
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium"
        },

        display_content: {
            title: { type: String, required: true },
            description: { type: String, required: true },
            icon: { type: String },
        },

        execution_payload: {
            action_type: {
                type: String,
                enum: ["send_message", "update_db", "schedule_event", "create_campaign", "cancel_appointment", "missing_info"],
                required: true
            },
            params: { type: Schema.Types.Mixed },
        },

        created_at: { type: Date, default: Date.now },
    }
);

const ActionCard = models.ActionCard || model<IActionCard>("ActionCard", ActionCardSchema);

export default ActionCard;
