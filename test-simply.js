// הגדרות לבדיקה בלבד
const COMPANY_LOGIN = "fozaisolutions";
const API_KEY =
    "db6517c9c5026bfae8b25c64b3582b2678e8a81aa7204e1ffc559ed12b3f1f68";

// כתובת ה-API
const BASE_URL = "https://user-api.simplybook.me";

async function testConnection() {
    console.log("🚀 מתחיל בדיקת חיבור ל-SimplyBook...");

    try {
        // שלב 1: בקשת טוקן (כניסה)
        console.log("🔑 מבקש טוקן אבטחה...");

        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "getToken",
                params: [COMPANY_LOGIN, API_KEY],
                id: 1,
            }),
        });

        const loginData = await loginResponse.json();

        if (loginData.error) {
            console.error("❌ שגיאה בהתחברות:", loginData.error);
            return;
        }

        const token = loginData.result;
        console.log("✅ התקבל טוקן בהצלחה!"); // לא מדפיסים אותו כי הוא ארוך

        // שלב 2: בדיקת רשימת שירותים (כדי לראות שאנחנו קוראים נתונים)
        console.log("📋 מושך רשימת שירותים מהיומן...");

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

        if (servicesData.error) {
            console.error("❌ שגיאה בשליפת נתונים:", servicesData.error);
        } else {
            console.log("✅ הצלחה! הנה השירותים שיש ביומן:");
            const services = Object.values(servicesData.result);
            if (services.length === 0) {
                console.log(
                    "⚠️ (הרשימה ריקה - כנראה לא הגדרת שירותים עדיין בממשק של SimplyBook)"
                );
            } else {
                services.forEach((s) =>
                    console.log(`- ${s.name} (ID: ${s.id})`)
                );
            }
        }
    } catch (error) {
        console.error("❌ שגיאה קריטית בחיבור:", error.message);
    }
}

testConnection();
