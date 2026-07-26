export default function TermsPage() {
    return (
        <div
            className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800"
            dir="rtl"
        >
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                <h1 className="text-3xl font-bold mb-6 text-purple-900">
                    תנאי שימוש - FOZ AI Solutions
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    עודכן לאחרונה: נובמבר 2025
                </p>

                <div className="space-y-6">
                    <section>
                        <h2 className="text-xl font-bold mb-2">1. כללי</h2>
                        <p>
                            ברוכים הבאים ל-FOZ AI Solutions. השימוש במערכת,
                            לרבות הצ'אט-בוט לזימון תורים, כפוף לתנאים המפורטים
                            להלן. עצם השימוש במערכת מהווה הסכמה לתנאים אלו.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            2. מהות השירות
                        </h2>
                        <p>
                            המערכת מספקת שירותי אוטומציה וניהול קליניקות באמצעות
                            בינה מלאכותית (AI). המערכת מתממשקת ליומן העסק (כגון
                            SimplyBook) ומבצעת פעולות בשם בעל/ת העסק.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            3. הגבלת אחריות (AI)
                        </h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                השירות מבוסס על מודלים של בינה מלאכותית (LLMs).
                                למרות המאמצים לדיוק, ייתכנו טעויות ("הזיות")
                                במידע הנמסר על ידי הבוט.
                            </li>
                            <li>
                                האחריות הסופית לווידוא פרטי התור, המחיר והטיפול
                                חלה על המשתמש ועל בעל העסק.
                            </li>
                            <li>
                                FOZ AI לא תישא באחריות לכל נזק, ישיר או עקיף,
                                שייגרם כתוצאה משימוש במערכת, לרבות תקלות בזימון
                                תורים או אי-הבנות בשיחה.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            4. שימוש במידע
                        </h2>
                        <p>
                            בעת השימוש בצ'אט, את/ה מוסר/ת פרטים אישיים (כגון שם
                            וטלפון) מרצונך החופשי, לצורך קביעת התור. המידע יישמר
                            במאגרי המידע של החברה ושל העסק.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold mb-2">
                            5. שינויים וזמינות
                        </h2>
                        <p>
                            החברה רשאית לשנות, להשעות או להפסיק את השירות בכל עת
                            וללא הודעה מוקדמת. איננו מתחייבים לזמינות של 100% של
                            המערכת.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
