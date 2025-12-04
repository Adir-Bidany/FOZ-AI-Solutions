// lib/simplybook.ts

const BASE_URL = "https://user-api.simplybook.me";

// --- Helper Functions ---

/**
 * פונקציית עזר גנרית לביצוע קריאות JSON-RPC
 * חוסכת את הכתיבה החוזרת של fetch בכל פעם
 */
async function jsonRpcRequest(
    method: string,
    params: any[] = [],
    creds?: { login: string; token: string }
) {
    const headers: any = { "Content-Type": "application/json" };

    // אם יש פרטי הזדהות, נוסיף אותם להדר
    if (creds) {
        headers["X-Company-Login"] = creds.login;
        headers["X-Token"] = creds.token;
    }

    // כתובת: לוגין נעשה מול /login, כל השאר מול ה-root
    const url = method === "getToken" ? `${BASE_URL}/login` : BASE_URL;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: method,
                params: params,
                id: 1,
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error(`SimplyBook API Error [${method}]:`, data.error);
            throw new Error(data.error.message || "Unknown API Error");
        }

        return data.result;
    } catch (error) {
        console.error(`Network/Logic Error [${method}]:`, error);
        return null;
    }
}

/**
 * השגת טוקן התחברות
 */
async function getToken(companyLogin: string, apiKey: string) {
    return await jsonRpcRequest("getToken", [companyLogin, apiKey]);
}

// --- Exported Functions ---

export async function getAvailableSlots(companyLogin: string, apiKey: string) {
    const token = await getToken(companyLogin, apiKey);
    if (!token) return "שגיאת התחברות ליומן (בדוק מפתחות API).";

    const creds = { login: companyLogin, token };

    // 1. השגת רשימת השירותים
    const servicesMap = await jsonRpcRequest("getEventList", [], creds);
    const services = Object.values(servicesMap || {});

    if (services.length === 0) return "לא הוגדרו טיפולים במערכת.";

    // לקיחת השירות הראשון כברירת מחדל (ניתן לשפר בעתיד לבחירה חכמה יותר)
    const firstService = services[0] as any;

    // 2. חישוב תאריכים (דינמי)
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    const fromDate = today.toISOString().split("T")[0];
    const toDate = twoWeeksLater.toISOString().split("T")[0];

    // 3. קבלת מטריצת זמנים
    // params: [dateFrom, dateTo, serviceId, providerId] (providerId=1 default)
    const timeMatrix = await jsonRpcRequest(
        "getStartTimeMatrix",
        [fromDate, toDate, firstService.id, 1],
        creds
    );

    if (!timeMatrix || Object.keys(timeMatrix).length === 0) {
        return `לא נמצאו תורים פנויים לשבועיים הקרובים עבור ${firstService.name}.`;
    }

    // 4. פירמוט התוצאה
    let foundSlots: string[] = [];
    const sortedDates = Object.keys(timeMatrix).sort();

    for (const date of sortedDates) {
        const times = timeMatrix[date];
        if (times && times.length > 0) {
            // לוקחים עד 3 שעות מכל יום כדי לא להציף
            for (const time of times.slice(0, 3)) {
                foundSlots.push(`${date} בשעה ${time}`);
                if (foundSlots.length >= 3) break;
            }
        }
        if (foundSlots.length >= 3) break;
    }

    return `התורים הפנויים הקרובים ל${firstService.name}: ${foundSlots.join(
        ", "
    )}.`;
}

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

    const creds = { login: companyLogin, token };

    // 1. השגת מזהה שירות
    const servicesMap = await jsonRpcRequest("getEventList", [], creds);
    const services = Object.values(servicesMap || {});
    if (services.length === 0) return "שגיאה: אין שירותים זמינים לקביעה.";

    const serviceId = (services[0] as any).id;

    // 2. ביצוע ההזמנה
    // params: [serviceId, providerId, date, time, clientData, additionalFields, count]
    const clientData = {
        name: clientName,
        phone: clientPhone,
        email: "client@foz.ai", // אימייל דמי או כזה שמגיע מהמשתמש
    };

    try {
        const bookingResult = await jsonRpcRequest(
            "book",
            [
                serviceId,
                1, // Provider ID hardcoded to 1 (Risk: might need to be dynamic later)
                date,
                time,
                clientData,
                null,
                null,
            ],
            creds
        );

        if (!bookingResult) {
            // אם חזר null סימן שהייתה שגיאה ב-helper
            return "השעה הזו כנראה נתפסה או שפרטי התור אינם תקינים. נסה שעה אחרת.";
        }

        return `התור נקבע בהצלחה! מספר אישור: ${bookingResult}`;
    } catch (e) {
        return "תקלה בקביעת התור.";
    }
}

export async function getClientHistory(
    query: string,
    companyLogin: string,
    apiKey: string
) {
    const token = await getToken(companyLogin, apiKey);
    if (!token) return "שגיאת התחברות לקבלת היסטוריה.";

    const creds = { login: companyLogin, token };

    // חישוב תאריכים דינמי (שנה אחורה ושנה קדימה)
    const now = new Date();
    const oneYearAgo = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
    )
        .toISOString()
        .split("T")[0];
    const oneYearForward = new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
    )
        .toISOString()
        .split("T")[0];

    // שימוש בפילטרים של SimplyBook
    const filters = {
        date_from: oneYearAgo,
        date_to: oneYearForward,
        // הערה: החיפוש ב-SimplyBook הוא מוגבל.
        // אנו שולפים טווח ומסננים בזיכרון (JS) כי ה-API לא תמיד תומך ב-search query בגרסאות מסוימות
    };

    const bookings = await jsonRpcRequest("getBookings", [filters], creds);

    if (!bookings || bookings.length === 0) {
        return "לא נמצאו תורים במערכת בטווח הזמן שנבדק.";
    }

    // סינון ידני לפי שם או טלפון (כי ה-API מחזיר הכל לפעמים)
    const filteredBookings = bookings.filter((b: any) => {
        const clientName = b.client?.name?.toLowerCase() || "";
        const clientPhone = b.client?.phone || "";
        const q = query.toLowerCase();
        return clientName.includes(q) || clientPhone.includes(q);
    });

    if (filteredBookings.length === 0) return `לא נמצאו תורים עבור "${query}".`;

    // החזרת התוצאה
    return filteredBookings
        .slice(0, 5) // רק 5 אחרונים
        .map(
            (b: any) =>
                `📅 ${b.start_date} | ✂️ ${
                    b.service?.name || "טיפול"
                } | סטאטוס: ${b.status}`
        )
        .join("\n");
}
