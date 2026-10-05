import React from "react";
import { notFound } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Business from "@/models/Business";

export default async function TenantLandingPage({
    params,
}: {
    params: { subdomain: string };
}) {
    await connectToDatabase();
    
    // Find the business matching this subdomain
    const business = await Business.findOne({ subdomain: params.subdomain });

    if (!business) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-center" dir="rtl">
            <div className="max-w-2xl bg-white p-12 rounded-3xl shadow-xl">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{business.businessName}</h1>
                <p className="text-xl text-gray-600 mb-8">
                    ברוכים הבאים לעמוד ה-AI הרשמי של {business.businessName}.
                </p>
                <div className="text-sm text-gray-400">
                    (עמוד נחיתה וצ'אט-בוט יוטמעו כאן בשלבים הבאים)
                </div>
            </div>
        </div>
    );
}
