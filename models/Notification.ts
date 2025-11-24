import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    persona: { type: String, required: true }, // מי שלח? 'daniella', 'michal', 'roi'
    type: {
        type: String,
        enum: ["info", "success", "alert", "insight"],
        default: "info",
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    actionLink: { type: String }, // לינק לפעולה (למשל "צפה בשיחה")
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

const Notification =
    models.Notification || model("Notification", NotificationSchema);

export default Notification;
