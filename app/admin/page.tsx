"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Store,
    UserPlus,
    LayoutDashboard,
    ShieldCheck,
    Sparkles,
    ExternalLink,
    LogIn,
    LayoutTemplate,
    Search,
} from "lucide-react";
import Link from "next/link";
// import Image from "next/image"; // לא צריך את זה כי מחקנו את ה-Header הפנימי

interface Client {
    _id: string;
    businessName: string;
    ownerName: string;
    email: string;
    slug: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // הוספתי useEffect כדי לטעון נתונים רק אחרי אימות
    useEffect(() => {
        if (isAuthenticated) {
            fetchClients();
        }
    }, [isAuthenticated]);

    const handleLogin = () => {
        if (password === "admin123") {
            setIsAuthenticated(true);
        } else {
            alert("סיסמה שגויה");
        }
    };

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/clients");
            if (!res.ok) throw new Error("Failed to fetch");
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

    const handleDelete = async (clientId: string, clientName: string) => {
        if (!confirm(`האם את/ה בטוח/ה שברצונך למחוק את ${clientName}?`)) return;

        try {
            const res = await fetch(`/api/admin/clients/${clientId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to delete");
            }

            const data = await res.json();
            if (data.success) {
                setClients((prev) => prev.filter((c) => c._id !== clientId));
                alert("הלקוח נמחק בהצלחה.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("תקלה במחיקת הלקוח. בדוק את הקונסול לפרטים.");
        }
    };

    const handleLoginAsClient = async (email: string, slug: string) => {
        const masterKeyInput = prompt(
            `נא להזין סיסמת מאסטר כדי להיכנס לחשבון של ${email}:`
        );
        if (!masterKeyInput) return;

        try {
            const result = await signIn("credentials", {
                email: email,
                password: masterKeyInput,
                redirect: false,
            });

            if (result?.ok) {
                router.refresh();
                router.push(`/dashboard/${slug}`);
            } else {
                alert("סיסמה שגויה! הגישה נדחתה.");
            }
        } catch (error) {
            console.error(error);
            alert("שגיאה בהתחברות");
        }
    };

    if (!isAuthenticated) {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-gray-50/50"
                dir="rtl"
            >
                <Card className="w-full max-w-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-center text-xl font-bold text-gray-800">
                            כניסת מנהל מערכת
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder="סיסמה"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleLogin()
                            }
                        />
                        <Button
                            className="w-full bg-gray-900 hover:bg-black"
                            onClick={handleLogin}
                        >
                            התחבר
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-8" dir="rtl">
            {/* מחקנו את ה-Header הכפול מכאן */}

            <main className="p-8 max-w-[1600px] mx-auto space-y-10">
                {/* כותרת העמוד */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ShieldCheck className="text-purple-600" />
                        מרכז שליטה וניהול
                    </h1>
                    <div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm text-gray-500">
                        מחובר כמנהל (Admin)
                    </div>
                </div>

                {/* ניווט מהיר - מעודכן עם 6 כרטיסים */}
                <section>
                    <h2 className="text-lg font-bold mb-6 text-gray-700 flex items-center gap-2">
                        מפת האתר (Development Hub)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        <Link href="/" target="_blank">
                            <Card className="hover:bg-purple-50 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-purple-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex gap-2">
                                        <Store className="w-4 h-4 text-purple-600" />{" "}
                                        אתר הבית
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        שיווק (Public)
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/onboarding" target="_blank">
                            <Card className="hover:bg-blue-50 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-blue-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex gap-2">
                                        <UserPlus className="w-4 h-4 text-blue-600" />{" "}
                                        הרשמה
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        טופס הקמה
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/setup/demo" target="_blank">
                            <Card className="hover:bg-pink-50 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-pink-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex gap-2">
                                        <Sparkles className="w-4 h-4 text-pink-600" />{" "}
                                        צ'אט הקמה
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        ראיון בוט (Setup)
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/c/demo" target="_blank">
                            <Card className="hover:bg-green-50 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-green-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex gap-2">
                                        <LayoutTemplate className="w-4 h-4 text-green-600" />{" "}
                                        אתר לקוחה
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        תצוגת דמו
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/demo" target="_blank">
                            <Card className="hover:bg-orange-50 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-orange-500 shadow-sm">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-orange-600" />{" "}
                                        דשבורד
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-500">
                                        ניהול דמו
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <div className="opacity-50">
                            <Card className="h-full bg-gray-100 border-dashed">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex gap-2 text-gray-500">
                                        <ShieldCheck className="w-4 h-4" />{" "}
                                        אדמין
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-gray-400">
                                        אתה כאן
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* טבלת הלקוחות */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-lg text-gray-800">
                            לקוחות רשומים
                        </h2>
                        <div className="relative w-72">
                            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="חיפוש לפי שם או עסק..."
                                className="pr-10 bg-white"
                            />
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-right">
                            <thead className="[&_tr]:border-b bg-gray-50/80 text-gray-600">
                                <tr className="border-b transition-colors">
                                    <th className="h-12 px-6 align-middle font-medium">
                                        שם העסק
                                    </th>
                                    <th className="h-12 px-6 align-middle font-medium">
                                        בעלים
                                    </th>
                                    <th className="h-12 px-6 align-middle font-medium">
                                        תאריך הצטרפות
                                    </th>
                                    <th className="h-12 px-6 align-middle font-medium">
                                        ממשקים
                                    </th>
                                    <th className="h-12 px-6 align-middle font-medium">
                                        פעולות מהירות
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {clients.map((client) => (
                                    <tr
                                        key={client._id}
                                        className="transition-colors hover:bg-purple-50/30"
                                    >
                                        <td className="p-6 font-medium text-gray-900">
                                            {client.businessName}
                                        </td>
                                        <td className="p-6">
                                            <div className="font-medium">
                                                {client.ownerName}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {client.email}
                                            </div>
                                        </td>
                                        <td className="p-6 text-gray-500">
                                            {new Date(
                                                client.createdAt
                                            ).toLocaleDateString("he-IL")}
                                        </td>
                                        <td className="p-6">
                                            <Link
                                                href={`/c/${client.slug}`}
                                                target="_blank"
                                            >
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 text-xs bg-white hover:bg-gray-50"
                                                >
                                                    <ExternalLink
                                                        size={12}
                                                        className="ml-1"
                                                    />{" "}
                                                    אתר חי
                                                </Button>
                                            </Link>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs gap-1 border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-800 bg-purple-50/50"
                                                    onClick={() =>
                                                        handleLoginAsClient(
                                                            client.email,
                                                            client.slug
                                                        )
                                                    }
                                                >
                                                    <LogIn size={12} /> כניסה
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2"
                                                    onClick={() =>
                                                        handleDelete(
                                                            client._id,
                                                            client.businessName
                                                        )
                                                    }
                                                >
                                                    מחק
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {clients.length === 0 && !isLoading && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-10 text-center text-gray-400"
                                        >
                                            עדיין אין לקוחות. זה הזמן ללחוץ על
                                            כפתור "הרשמה" ולבצע ניסוי!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
