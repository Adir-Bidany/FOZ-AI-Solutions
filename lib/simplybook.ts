const COMPANY_LOGIN = process.env.SIMPLYBOOK_COMPANY!;
const API_KEY = process.env.SIMPLYBOOK_API_KEY!;

const BASE_URL = `https://user-api.simplybook.me`;

// פונקציה לקבלת טוקן
async function getToken() {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "getToken",
                params: [COMPANY_LOGIN, API_KEY],
                id: 1,
            }),
        });

        const data = await response.json();
        if (data.error) {
            console.error("Token Error:", data.error);
            return null;
        }
        return data.result;
    } catch (error) {
        console.error("Auth Error:", error);
        return null;
    }
}

// הפונקציה החכמה: מחזירה את 3 התורים הבאים הפנויים
export async function getAvailableSlots() {
    const token = await getToken();
    if (!token) return "שגיאת התחברות ליומן.";

    // בדיקה לשבועיים קדימה כדי לוודא שנמצא משהו
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    const fromDate = today.toISOString().split("T")[0];
    const toDate = twoWeeksLater.toISOString().split("T")[0];

    try {
        const response = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": COMPANY_LOGIN,
                "X-Token": token,
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "getStartTimeMatrix",
                params: [
                    fromDate,
                    toDate,
                    2, // שירות מס' 2 (הסרת שיער ידיים - וודא שזה קיים אצלך)
                    1, // Provider ID (מטפל ראשון)
                ],
                id: 1,
            }),
        });

        const data = await response.json();

        if (!data.result || Object.keys(data.result).length === 0) {
            return "לא נמצאו תורים פנויים בשבועיים הקרובים.";
        }

        // --- הלוגוסיקה החדשה: שליפת 3 התורים הבאים ---
        let foundSlots: string[] = [];

        // המידע מגיע כאובייקט { "2025-11-25": ["10:00", "11:00"], "2025-11-26": [] }
        // אנחנו עוברים על התאריכים לפי הסדר
        const sortedDates = Object.keys(data.result).sort();

        for (const date of sortedDates) {
            const times = data.result[date]; // רשימת השעות באותו יום
            if (times && times.length > 0) {
                for (const time of times) {
                    foundSlots.push(`${date} בשעה ${time}`);
                    // ברגע שמצאנו 3, אנחנו עוצרים
                    if (foundSlots.length === 3) break;
                }
            }
            if (foundSlots.length === 3) break;
        }

        if (foundSlots.length === 0) {
            return "היומן מלא בשבועיים הקרובים.";
        }

        return `התורים הבאים הפנויים הם: ${foundSlots.join(
            ", "
        )}. תשאל את הלקוח אם אחד מהם מתאים לו.`;
    } catch (error) {
        console.error("Get Slots Error:", error);
        return "תקלה בבדיקת הזמינות.";
    }
}
