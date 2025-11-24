import mongoose, { Schema, model, models } from "mongoose";

const ConversationSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true }, // שייך לקליניקה של שרה
    userPhone: { type: String }, // טלפון הלקוחה (אם הושאר)
    userName: { type: String }, // שם הלקוחה

    // התוכן הגולמי
    messages: [
        {
            role: { type: String }, // 'user' או 'assistant'
            content: { type: String },
            timestamp: { type: Date, default: Date.now },
        },
    ],

    // --- החלק הגאוני: ניתוח עסקי (רועי האנליסט) ---
    analysis: {
        summary: { type: String }, // סיכום קצר לבעלת העסק ("התעניינה בבוטוקס, שאלה על כאב")
        sentiment: { type: String, enum: ["Positive", "Neutral", "Negative"] }, // מצב רוח
        leadScore: { type: Number, min: 1, max: 10 }, // כמה הליד הזה "חם" (1-10)
        objection: { type: String }, // למה היא לא סגרה? ("מחיר", "זמינות")
        actionItem: { type: String }, // המלצה לפעולה ("לחזור אליה מחר")
    },

    status: {
        type: String,
        enum: ["New", "FollowUp", "Closed", "Archived"],
        default: "New",
    },
    createdAt: { type: Date, default: Date.now },
});

const Conversation =
    models.Conversation || model("Conversation", ConversationSchema);

export default Conversation;
