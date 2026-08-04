"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Zap, Crown } from "lucide-react";
import SystemFooter from "@/components/SystemFooter"; // וודא שהנתיב נכון

export default function PricingPage() {
    // מתג לתשלום שנתי/חודשי (אופציונלי, כרגע נשאיר פשוט)
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "מתחילות (SOLO)",
            description:
                "למי שרוצה בוט חכם בבעלות מלאה ובמינימום הוצאות קבועות.",
            price: "₪1,497",
            period: "חד פעמי",
            features: [
                "מזכירה דיגיטלית (דניאלה) 24/7",
                "אתר נחיתה מעוצב אישי",
                "חיבור מלא ליומן SimplyBook",
                "ללא דמי מנוי חודשיים ל-FOZ",
                "חיבור API Key אישי (BYOK)",
                "תמיכה במייל",
            ],
            notIncluded: [
                "מנהלת עסקית (גולדה)",
                "זיכרון לקוח חכם & SMS",
                "עדכוני גרסה אוטומטיים",
            ],
            buttonText: "אני רוצה לרכוש עכשיו",
            buttonVariant: "outline",
            popular: false,
            icon: Zap,
        },
        {
            name: "צמיחה (GROWTH)",
            description:
                "המסלול המומלץ. תני לנו לנהל את הטכנולוגיה, את תנהלי את העסק.",
            price: "₪297",
            period: "/ חודש",
            features: [
                "כל מה שיש במסלול מתחילות",
                "כולל עלויות שיחה (AI Tokens)",
                "גישה ל'חדר המצב' (מנהלת עסקית)",
                "ייעוץ שיווקי ופיננסי (גולדה)",
                "דשבורד ניהולי מתקדם",
                "תמיכה בוואטסאפ לעסקים",
            ],
            notIncluded: ["זיכרון לקוח חכם & SMS"],
            buttonText: "התחלי 14 יום חינם",
            buttonVariant: "default", // כפתור מודגש
            popular: true, // מדגיש את הכרטיס
            icon: Sparkles,
        },
        {
            name: "אימפריה (EMPIRE)",
            description: "מערכת CRM מלאה שלומדת את הלקוחות שלך ומגדילה מכירות.",
            price: "₪597",
            period: "/ חודש",
            features: [
                "כל מה שיש במסלול צמיחה",
                "זיכרון לקוח חכם (RAG)",
                "זיהוי לקוחה חוזרת אוטומטי",
                "אימות מאובטח ב-SMS",
                "הצעות מכר מותאמות אישית ללקוחה",
                "קדימות בתמיכה טכנית (VIP)",
            ],
            notIncluded: [],
            buttonText: "דברו איתי על פרימיום",
            buttonVariant: "outline",
            popular: false,
            icon: Crown,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* אין צורך ב-Header כי הוא ב-Layout */}

            <main className="py-20 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">
                    {/* כותרת העמוד */}
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                            השקעה קטנה,{" "}
                            <span className="text-purple-600">
                                שקט נפשי גדול
                            </span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            בחרי את המסלול שמתאים לשלב שבו העסק שלך נמצא כרגע.
                            <br className="hidden md:block" />
                            תמיד אפשר לשדרג כשהיומן יתחיל להתפוצץ.
                        </p>
                    </div>

                    {/* גריד המחירים */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative bg-white rounded-3xl p-8 transition-all duration-300 border
                  ${
                      plan.popular
                          ? "border-purple-500 shadow-2xl scale-105 z-10 ring-4 ring-purple-50"
                          : "border-gray-200 shadow-lg hover:shadow-xl hover:-translate-y-1"
                  }
                `}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                        הכי פופולרי 🏆
                                    </div>
                                )}

                                {/* כותרת הכרטיס */}
                                <div className="mb-6">
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                                            plan.popular
                                                ? "bg-purple-100 text-purple-600"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        <plan.icon size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-2 min-h-[40px]">
                                        {plan.description}
                                    </p>
                                </div>

                                {/* המחיר */}
                                <div className="mb-8 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold text-gray-900">
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-500 font-medium">
                                        {plan.period}
                                    </span>
                                </div>

                                {/* כפתור פעולה */}
                                <div className="mb-8">
                                    <Link href="/onboarding">
                                        <Button
                                            className={`w-full h-12 rounded-xl text-base font-bold shadow-md ${
                                                plan.popular
                                                    ? "bg-gray-900 hover:bg-gray-800 text-white"
                                                    : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
                                            }`}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    </Link>
                                    {plan.period === "חד פעמי" && (
                                        <p className="text-xs text-center text-zinc-300 dark:text-zinc-300 mt-2">
                                            * דורש חשבון Google AI ו-SimplyBook
                                        </p>
                                    )}
                                </div>

                                {/* פיצ'רים */}
                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-gray-900">
                                        מה כלול בחבילה:
                                    </p>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-3 text-sm text-gray-600"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Check
                                                        size={12}
                                                        className="text-green-600 font-bold"
                                                    />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                        {plan.notIncluded.map((feature, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-3 text-sm text-gray-400 line-through decoration-gray-300"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                                    <X
                                                        size={12}
                                                        className="text-gray-400"
                                                    />
                                                </div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* אזור שאלות ותשובות (FAQ) קצר */}
                    <div className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-center mb-8">
                            שאלות נפוצות
                        </h2>
                        <div className="grid gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2">
                                    מה זה אומר "תשלום חד פעמי"?
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    במסלול זה אתם רוכשים את הרישיון לשימוש בבוט
                                    לכל החיים. כדי שהבוט יעבוד, תצטרכו לחבר אותו
                                    למפתח משלכם (נסביר איך, זה לוקח 2 דקות).
                                    העלויות השוטפות הן מול גוגל ישירות (לרוב
                                    חינם בהתחלה).
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2">
                                    האם אפשר לשדרג אחר כך?
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    בטח! אפשר להתחיל במסלול חד-פעמי, וכשהעסק גדל
                                    ורוצים את המנהלת העסקית (גולדה) והזיכרון
                                    החכם, אפשר לעבור למנוי חודשי בזיכוי מלא.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
