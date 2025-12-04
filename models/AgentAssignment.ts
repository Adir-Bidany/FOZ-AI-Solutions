import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// --- Agent Assignment (Task Delegation) ---
export interface IAgentAssignment extends Document {
    tenant_id: Types.ObjectId;
    assigned_to: "Michal" | "Roi"; // Marketing or Finance
    assigned_by: "Golda" | "David" | "System";

    task_type: "campaign_creation" | "financial_report" | "follow_up";
    description: string;

    status: "pending" | "in_progress" | "completed" | "failed";
    result_artifact?: string; // Link to report or campaign ID

    due_date?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AgentAssignmentSchema = new Schema<IAgentAssignment>(
    {
        tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
        assigned_to: { type: String, enum: ["Michal", "Roi"], required: true },
        assigned_by: { type: String, required: true },

        task_type: { type: String, required: true },
        description: { type: String, required: true },

        status: { type: String, enum: ["pending", "in_progress", "completed", "failed"], default: "pending" },
        result_artifact: { type: String },

        due_date: { type: Date },
    },
    { timestamps: true }
);

const AgentAssignment = models.AgentAssignment || model<IAgentAssignment>("AgentAssignment", AgentAssignmentSchema);

export default AgentAssignment;
