import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Client from "@/models/Client";

export async function POST(req: Request) {
    try {
        const { slug, question, answer } = await req.json();
        await connectDB();

        // מציאת הלקוח
        const client = await Client.findOne({ slug });

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );
        }

        // עדכון המידע הקיים בתוספת המידע החדש
        // אנחנו משרשרים את המידע כדי ליצור "מסמך הנחיות" אחד גדול
        const newInfo = `\n\nש: ${question}\nת: ${answer}`;

        // אם זו פעם ראשונה שיש תוכן, או שזה עדכון
        if (!client.domainGuidelines) {
            client.domainGuidelines = `מידע שהתקבל מבעלת העסק:${newInfo}`;
        } else {
            client.domainGuidelines += newInfo;
        }

        await client.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Save Error:", error);
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}
