import mongoose, { Schema, model, models, Document, Types } from "mongoose";

// --- Dashboard Live State (Read-Only for Frontend) ---
export interface IDashboardLiveState extends Document {
    tenant_id: Types.ObjectId;

    metrics: {
        daily_revenue: number;
        appointments_today: number;
        leads_today: number;
    };

    active_alerts: Array<{
        id: string;
        severity: "info" | "warning" | "critical";
        message: string;
        timestamp: Date;
    }>;

    widgets_data: Record<string, any>; // Flexible data for charts/graphs

    last_updated: Date;
}

const DashboardLiveStateSchema = new Schema<IDashboardLiveState>(
    {
        tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, unique: true },

        metrics: {
            daily_revenue: { type: Number, default: 0 },
            appointments_today: { type: Number, default: 0 },
            leads_today: { type: Number, default: 0 },
        },

        active_alerts: [
            {
                id: { type: String },
                severity: { type: String, enum: ["info", "warning", "critical"] },
                message: { type: String },
                timestamp: { type: Date, default: Date.now },
            },
        ],

        widgets_data: { type: Map, of: Schema.Types.Mixed },

        last_updated: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const DashboardLiveState = models.DashboardLiveState || model<IDashboardLiveState>("DashboardLiveState", DashboardLiveStateSchema);

export default DashboardLiveState;
