const COMPANY_LOGIN = process.env.SIMPLYBOOK_COMPANY!;
const API_KEY = process.env.SIMPLYBOOK_API_KEY!;

const BASE_URL = `https://user-api.simplybook.me`;

/**
 * 1. קבלת טוקן אבטחה (נדרש לפני כל פעולה)
 */
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
            console.error("SimplyBook Token Error:", data.error);
            return null;
        }
        return data.result;
    } catch (error) {
        console.error("SimplyBook Auth Error:", error);
        return null;
    }
}

/**
 * 2. בדיקת שעות פנויות
 * סורק שבועיים קדימה ומחזיר את 3 התורים הפנויים הבאים
 */
export async function getAvailableSlots() {
    const token = await getToken();
    if (!token) return "שגיאת התחברות למערכת הזימון.";

    try {
        // א. משיגים את השירות הראשון שקיים במערכת
        const servicesResponse = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": COMPANY_LOGIN,
                "X-Token": token,
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "getEventList",
                params: [],
                id: 1,
            }),
        });

        const servicesData = await servicesResponse.json();
        const services = Object.values(servicesData.result || {});
        if (services.length === 0) return "לא הוגדרו טיפולים במערכת.";

        const firstServiceId = (services[0] as any).id; // ה-ID האמיתי

        // ב. בודקים זמינות לשירות הזה
        const today = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(today.getDate() + 14);

        const fromDate = today.toISOString().split("T")[0];
        const toDate = twoWeeksLater.toISOString().split("T")[0];

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
                params: [fromDate, toDate, firstServiceId, 1],
                id: 1,
            }),
        });

        const data = await response.json();

        if (!data.result || Object.keys(data.result).length === 0) {
            return "לא נמצאו תורים פנויים בשבועיים הקרובים.";
        }

        // ג. סינון 3 תורים
        let foundSlots: string[] = [];
        const sortedDates = Object.keys(data.result).sort();

        for (const date of sortedDates) {
            const times = data.result[date];
            if (times && times.length > 0) {
                for (const time of times) {
                    foundSlots.push(`${date} בשעה ${time}`);
                    if (foundSlots.length === 3) break;
                }
            }
            if (foundSlots.length === 3) break;
        }

        if (foundSlots.length === 0) return "היומן מלא בשבועיים הקרובים.";

        return `התורים הבאים הפנויים הם: ${foundSlots.join(", ")}.`;
    } catch (error) {
        console.error("Get Slots Error:", error);
        return "תקלה בבדיקת הזמינות.";
    }
}

/**
 * 3. קביעת תור (Booking)
 * מקבלת תאריך, שעה, שם וטלפון ומבצעת רישום ביומן
 */
export async function bookAppointment(
    date: string,
    time: string,
    clientName: string,
    clientPhone: string
) {
    const token = await getToken();
    if (!token) return "שגיאת התחברות ליומן.";

    try {
        // א. שוב, מוצאים את ה-ID של השירות (כדי לא לנחש)
        const servicesResponse = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": COMPANY_LOGIN,
                "X-Token": token,
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "getEventList",
                params: [],
                id: 1,
            }),
        });
        const servicesData = await servicesResponse.json();
        const services = Object.values(servicesData.result || {});
        if (services.length === 0) return "שגיאה: אין שירותים זמינים לקביעה.";
        const serviceId = (services[0] as any).id;

        // ב. שליחת פקודת ההזמנה (Book)
        const response = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": COMPANY_LOGIN,
                "X-Token": token,
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "book",
                params: [
                    serviceId, // ה-ID שמצאנו
                    1, // מטפל (ברירת מחדל 1)
                    date, // YYYY-MM-DD
                    time, // HH:mm
                    {
                        name: clientName,
                        phone: clientPhone,
                        email: "client@foz-system.com", // מייל דמה (חובה ב-API)
                    },
                    null, // additional fields
                    null, // count
                ],
                id: 1,
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error("Booking API Error:", data.error);
            // הודעת שגיאה ידידותית למשתמש אם התור נתפס הרגע
            if (data.error.message.includes("Time is busy")) {
                return "השעה הזו בדיוק נתפסה. נסה לבחור שעה אחרת.";
            }
            return `לא הצלחתי לקבוע את התור. שגיאה: ${data.error.message}`;
        }

        return `התור נקבע בהצלחה! אישור הזמנה מס': ${data.result}`;
    } catch (error) {
        console.error("Booking Exception:", error);
        return "תקלה טכנית בקביעת התור.";
    }
}
