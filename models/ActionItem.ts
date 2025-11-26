import mongoose, { Schema, model, models } from "mongoose";

const ActionItemSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    agentName: {
        type: String,
        enum: ["receptionist", "marketing", "analyst"],
        required: true,
    }, // מי הציע? (רועי/מיכל)

    title: { type: String, required: true }, // כותרת קצרה: "שימור לקוחה - דנה לוי"
    description: { type: String, required: true }, // הסבר: "לא ביקרה 4 חודשים. מציע לשלוח הודעה."

    type: {
        type: String,
        enum: ["send_sms", "create_story", "update_setting"],
        required: true,
    }, // סוג הפעולה
    payload: { type: Object }, // המידע הטכני לביצוע (למשל: תוכן ההודעה ומספר הטלפון)

    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "completed"],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
});

const ActionItem = models.ActionItem || model("ActionItem", ActionItemSchema);

export default ActionItem;
