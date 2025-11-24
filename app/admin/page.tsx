"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Activity,
    DollarSign,
    Search,
    ExternalLink,
    LogIn,
    LayoutTemplate,
    Store,
    UserPlus,
    LayoutDashboard,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface Client {
    _id: string;
    businessName: string;
    ownerName: string;
    slug: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogin = () => {
        if (password === "admin123") {
            setIsAuthenticated(true);
            fetchClients();
        } else {
            alert("סיסמה שגויה");
        }
    };

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/clients");
            const data = await res.json();
            if (data.success) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error("Failed to fetch clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Card className="w-full max-w-sm">
                    <CardHeader>
                        <CardTitle className="text-center">
                            כניסת מנהל מערכת
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder="סיסמה"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button className="w-full" onClick={handleLogin}>
                            התחבר
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <header className="bg-white border-b h-16 flex items-center px-6 justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-600 text-white p-1 rounded font-bold text-xs">
                        FOZ
                    </div>
                    <h1 className="font-bold text-xl text-gray-800">
                        מרכז שליטה (Super Admin)
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">מחובר כמנהל</span>
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                        A
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-7xl mx-auto space-y-8">
                {/* === אזור הניווט המהיר (הכל פתוח עכשיו!) === */}
                <section>
                    <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
                        <ShieldCheck size={20} className="text-purple-600" />
                        מפת האתר (Development Links)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* 1. אתר השיווק */}
                        <Link href="/" target="_blank">
                            <Card className="hover:bg-purple-50 transition-colors cursor-pointer border-purple-200 h-full shadow-sm hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Store className="w-4 h-4 text-purple-600" />
                                        אתר הבית (שיווק)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        עמוד המכירה הראשי של FOZ
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* 2. הקמת לקוח */}
                        <Link href="/onboarding" target="_blank">
                            <Card className="hover:bg-blue-50 transition-colors cursor-pointer border-blue-200 h-full shadow-sm hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-blue-600" />
                                        טופס הרשמה
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        המסך שבו הלקוחה מקימה את העסק
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* 3. עמוד לקוחה (דמו) */}
                        <Link href="/c/demo" target="_blank">
                            <Card className="hover:bg-green-50 transition-colors cursor-pointer border-green-200 h-full shadow-sm hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <LayoutTemplate className="w-4 h-4 text-green-600" />
                                        אתר לקוחה (Demo)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        האתר שהלקוחות של הקליניקה רואים
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* 4. דשבורד לקוחה (דמו) - חדש! */}
                        <Link href="/dashboard/demo" target="_blank">
                            <Card className="hover:bg-orange-50 transition-colors cursor-pointer border-orange-200 h-full shadow-sm hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-orange-600" />
                                        דשבורד ניהול (Demo)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        האזור האישי של בעלת העסק
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* 5. מרכז ניהול (אתה כבר כאן) */}
                        <div className="opacity-50 cursor-default">
                            <Card className="h-full bg-gray-100 border-gray-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-gray-500">
                                        <ShieldCheck className="w-4 h-4" />
                                        סופר-אדמין
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-400">
                                        אתה נמצא כאן
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* טבלת הלקוחות (נשאר אותו דבר) */}
                <div className="bg-white rounded-lg border shadow-sm">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h2 className="font-bold text-lg">
                            לקוחות רשומים במערכת
                        </h2>
                        <div className="relative w-64">
                            <Search className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input placeholder="חיפוש..." className="pr-8" />
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-right">
                            <thead className="[&_tr]:border-b bg-gray-50">
                                <tr className="border-b transition-colors">
                                    <th className="h-12 px-4 align-middle font-medium text-gray-500">
                                        שם העסק
                                    </th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-500">
                                        בעלים
                                    </th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-500">
                                        תאריך הצטרפות
                                    </th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-500">
                                        קישורים
                                    </th>
                                    <th className="h-12 px-4 align-middle font-medium text-gray-500">
                                        פעולות
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr
                                        key={client._id}
                                        className="border-b transition-colors hover:bg-gray-50/50"
                                    >
                                        <td className="p-4 font-medium">
                                            {client.businessName}
                                        </td>
                                        <td className="p-4">
                                            {client.ownerName}
                                        </td>
                                        <td className="p-4">
                                            {new Date(
                                                client.createdAt
                                            ).toLocaleDateString("he-IL")}
                                        </td>
                                        <td className="p-4 flex gap-2">
                                            <Link
                                                href={`/c/${client.slug}`}
                                                target="_blank"
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                >
                                                    אתר
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/dashboard/${client.slug}`}
                                                target="_blank"
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                >
                                                    ניהול
                                                </Button>
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs text-red-500"
                                            >
                                                חסום
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
