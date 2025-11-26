import mongoose, { Schema, models, model } from "mongoose";

const CustomerSchema = new Schema(
    {
        // קישור לקליניקה הספציפית (כדי שלא נערבב לקוחות בין קליניקות)
        clinicId: {
            type: Schema.Types.ObjectId,
            ref: "Client",
            required: true,
        },

        // המזהה הראשי - מספר טלפון
        phone: { type: String, required: true },

        name: { type: String }, // נלמד תוך כדי שיחה

        // היסטוריית הביקורים (נבנית אוטומטית מ-SimplyBook או מסיכומי שיחה)
        history: [
            {
                date: { type: Date, default: Date.now },
                service: String,
                price: Number,
                summary: String, // "הייתה מרוצה, ביקשה לא ללחוץ חזק"
                aiNotes: String, // תובנות נסתרות לבוט
            },
        ],

        // העדפות אישיות (נצברות עם הזמן)
        preferences: {
            type: [String],
            default: [],
        }, // ["מעדיפה ערב", "רגישה לחום", "שותה הפוך"]
    },
    { timestamps: true }
);

// אינדקס ייחודי: אי אפשר אותה לקוחה פעמיים באותה קליניקה
CustomerSchema.index({ clinicId: 1, phone: 1 }, { unique: true });

const Customer = models.Customer || model("Customer", CustomerSchema);
export default Customer;
