export default function PrivacyPage() {
    return (
        <div
            className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800"
            dir="rtl"
        >
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold mb-6 text-purple-900">
                    מדיניות פרטיות - FOZ AI Solutions
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    עודכן לאחרונה: נובמבר 2025
                </p>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            1. איזה מידע אנחנו אוספים?
                        </h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                פרטי קשר: שם מלא, מספר טלפון, ולעיתים כתובת
                                אימייל.
                            </li>
                            <li>
                                תוכן השיחות: כל התכתובת מול הבוט נשמרת לצורך
                                שיפור השירות, תיעוד וניהול התור.
                            </li>
                            <li>
                                מידע טכני: כתובת IP, סוג דפדפן וזמני התחברות
                                (לצרכי אבטחה).
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            2. כיצד אנו משתמשים במידע?
                        </h2>
                        <p>המידע משמש אך ורק לצורך:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>קביעת וניהול תורים בקליניקה.</li>
                            <li>יצירת קשר במקרה של שינויים או ביטולים.</li>
                            <li>
                                אימון ושיפור מודל הבינה המלאכותית (באופן אנונימי
                                ככל הניתן).
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            3. העברת מידע לצד שלישי
                        </h2>
                        <p>
                            על מנת לספק את השירות, אנו משתפים מידע עם הספקים
                            הבאים:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                <strong>SimplyBook / מערכות יומן:</strong> לצורך
                                ביצוע הזימון בפועל.
                            </li>
                            <li>
                                <strong>Google (Gemini AI):</strong> לצורך עיבוד
                                השפה הטבעית (תוכן השיחה עובר עיבוד בענן).
                            </li>
                            <li>
                                <strong>שירותי אחסון (MongoDB/Vercel):</strong>{" "}
                                לשמירת הנתונים בצורה מאובטחת.
                            </li>
                        </ul>
                        <p className="mt-2">
                            איננו מוכרים את המידע האישי שלך למפרסמים צד שלישי.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            4. אבטחת מידע
                        </h2>
                        <p>
                            אנו נוקטים באמצעי אבטחה מתקדמים (הצפנה, פרוטוקולי
                            אבטחה) כדי להגן על המידע. עם זאת, אף מערכת אינה
                            חסינה לחלוטין.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">5. יצירת קשר</h2>
                        <p>
                            בכל שאלה או בקשה למחיקת מידע, ניתן לפנות אלינו
                            במייל: support@foz.ai
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
