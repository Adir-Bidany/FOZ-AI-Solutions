const BASE_URL = `https://user-api.simplybook.me`;

// 1. פונקציה לקבלת טוקן (מקבלת מפתחות ספציפיים)
async function getToken(companyLogin: string, apiKey: string) {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "getToken",
                params: [companyLogin, apiKey],
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

// 2. בדיקת שעות פנויות (דינמית)
export async function getAvailableSlots(companyLogin: string, apiKey: string) {
    const token = await getToken(companyLogin, apiKey);
    if (!token) return "שגיאת התחברות ליומן (בדוק שהמפתחות בהגדרות נכונים).";

    try {
        // א. משיגים את השירות הראשון
        const servicesResponse = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": companyLogin,
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
        if (services.length === 0)
            return "לא הוגדרו טיפולים במערכת SimplyBook.";

        const firstServiceId = (services[0] as any).id;
        const firstServiceName = (services[0] as any).name;

        // ב. בודקים זמינות
        const today = new Date();
        const twoWeeksLater = new Date();
        twoWeeksLater.setDate(today.getDate() + 14);

        const fromDate = today.toISOString().split("T")[0];
        const toDate = twoWeeksLater.toISOString().split("T")[0];

        const response = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": companyLogin,
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
            return `לא נמצאו תורים פנויים לשבועיים הקרובים לטיפול ${firstServiceName}.`;
        }

        // ג. סינון
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

        return `התורים הבאים הפנויים ל${firstServiceName} הם: ${foundSlots.join(
            ", "
        )}.`;
    } catch (error) {
        console.error("Get Slots Error:", error);
        return "תקלה טכנית בבדיקת הזמינות.";
    }
}

// 3. קביעת תור (דינמית)
export async function bookAppointment(
    date: string,
    time: string,
    clientName: string,
    clientPhone: string,
    companyLogin: string,
    apiKey: string
) {
    const token = await getToken(companyLogin, apiKey);
    if (!token) return "שגיאת התחברות ליומן.";

    try {
        // א. משיגים שירות
        const servicesResponse = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": companyLogin,
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
        if (services.length === 0) return "שגיאה: אין שירותים זמינים.";
        const serviceId = (services[0] as any).id;

        // ב. הזמנה
        const response = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Company-Login": companyLogin,
                "X-Token": token,
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "book",
                params: [
                    serviceId,
                    1, // מטפל
                    date,
                    time,
                    {
                        name: clientName,
                        phone: clientPhone,
                        email: "client@foz.ai",
                    },
                    null,
                    null,
                ],
                id: 1,
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error("Booking API Error:", data.error);
            if (data.error.message.includes("Time is busy")) {
                return "השעה הזו נתפסה הרגע. נסה שעה אחרת.";
            }
            return `לא הצלחתי לקבוע. שגיאה: ${data.error.message}`;
        }

        return `התור נקבע בהצלחה! אישור: ${data.result}`;
    } catch (error) {
        console.error("Booking Exception:", error);
        return "תקלה טכנית בקביעת התור.";
    }
    
}

export async function getClientHistory(
    query: string,
    companyLogin: string,
    apiKey: string
) {
    // הערה: ב-SimplyBook API החיפוש הוא מורכב.
    // כאן אנחנו מבצעים סימולציה של שליפת רשימת ההזמנות וסינון לפי שם.
    // בגרסת הפרודקשן נצטרך להשתמש ב-getBookings עם פילטרים מדויקים יותר.

    const rpcUrl = "https://user-api.simplybook.me/login";
    const token = await getToken(companyLogin, apiKey); // נניח שיש לך פונקציית עזר פנימית כזו, או שתעתיק את הלוגיקה מ-getAvailableSlots

    // שליפת הזמנות עתידיות ועבר (פשטנו את זה לצורך הדוגמה)
    const response = await fetch("https://user-api.simplybook.me/bookings", {
        method: "POST",
        headers: {
            "X-Company-Login": companyLogin,
            "X-Token": token,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: "getBookings",
            params: {
                date_from: "2024-01-01", // מסתכלים שנה אחורה
                date_to: "2025-12-31",
                search_query: query, // חיפוש לפי שם או טלפון
            },
            id: 1,
        }),
    });

    const data = await response.json();
    if (data.result) {
        // עיבוד הנתונים לפורמט קריא לבוט
        return data.result
            .map(
                (b: any) =>
                    `תאריך: ${b.start_date} | שירות: ${b.service_name} | סטטוס: ${b.status}`
            )
            .join("\n");
    }

    return "לא נמצאו תורים ללקוחה זו.";
}

