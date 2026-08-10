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
    Trash2,
} from "lucide-react";
import Link from "next/link";
import GlobalHeader from "@/components/GlobalHeader";
import PazLeadsInbox from "@/components/admin/PazLeadsInbox";

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
    const [clients, setClients] = useState<Client[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Fetch data immediately since middleware guarantees admin RBAC
    useEffect(() => {
        fetchClients();
    }, []);

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
                router.push(`/dashboard`);
            } else {
                alert("סיסמה שגויה! הגישה נדחתה.");
            }
        } catch (error) {
            console.error(error);
            alert("שגיאה בהתחברות");
        }
    };

    const filteredClients = clients.filter(
        (c) =>
            c.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-16 font-sans" dir="rtl">
            <GlobalHeader />
            <main className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-10">
                {/* כותרת העמוד */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <ShieldCheck className="text-purple-500 w-8 h-8" />
                        מרכז שליטה וניהול
                    </h1>
                    <div className="bg-card border border-border px-4 py-2 rounded-full text-xs md:text-sm font-medium text-muted-foreground shadow-sm">
                        מחובר כמנהל (Admin)
                    </div>
                </div>

                {/* ניווט מהיר - 6 כרטיסים במראה פרימיום */}
                <section>
                    <h2 className="text-lg font-bold mb-6 text-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        מפת האתר (Development Hub)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        <Link href="/" target="_blank">
                            <Card className="bg-card hover:bg-accent/50 border border-border hover:border-purple-500/40 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-purple-500 shadow-sm rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-foreground font-bold">
                                        <Store className="w-4 h-4 text-purple-400" />
                                        אתר הבית
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        שיווק (Public)
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/onboarding" target="_blank">
                            <Card className="bg-card hover:bg-accent/50 border border-border hover:border-blue-500/40 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-blue-500 shadow-sm rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-foreground font-bold">
                                        <UserPlus className="w-4 h-4 text-blue-400" />
                                        הרשמה
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        טופס הקמה
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/onboarding" target="_blank">
                            <Card className="bg-card hover:bg-accent/50 border border-border hover:border-pink-500/40 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-pink-500 shadow-sm rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-foreground font-bold">
                                        <Sparkles className="w-4 h-4 text-pink-400" />
                                        צ'אט הקמה
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        ראיון בוט (Setup)
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/demo" target="_blank">
                            <Card className="bg-card hover:bg-accent/50 border border-border hover:border-amber-500/40 transition-all hover:-translate-y-1 duration-300 cursor-pointer h-full border-t-4 border-t-amber-500 shadow-sm rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-foreground font-bold">
                                        <LayoutDashboard className="w-4 h-4 text-amber-400" />
                                        דשבורד
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        ניהול דמו
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>

                        <div className="opacity-60">
                            <Card className="h-full bg-card/40 border-dashed border-border rounded-2xl">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
                                        <ShieldCheck className="w-4 h-4" />
                                        אדמין
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xs text-muted-foreground">
                                        אתה כאן
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <hr className="border-border/60" />

                {/* טבלת הלקוחות */}
                <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20">
                        <h2 className="font-bold text-lg text-foreground">
                            לקוחות רשומים ({filteredClients.length})
                        </h2>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="חיפוש לפי שם או עסק..."
                                className="pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-right">
                            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                                <tr>
                                    <th className="h-12 px-6 align-middle">
                                        שם העסק
                                    </th>
                                    <th className="h-12 px-6 align-middle">
                                        בעלים
                                    </th>
                                    <th className="h-12 px-6 align-middle">
                                        תאריך הצטרפות
                                    </th>
                                    <th className="h-12 px-6 align-middle">
                                        ממשקים
                                    </th>
                                    <th className="h-12 px-6 align-middle">
                                        פעולות מהירות
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredClients.map((client) => (
                                    <tr
                                        key={client._id}
                                        className="transition-colors hover:bg-muted/20"
                                    >
                                        <td className="p-6 font-bold text-foreground">
                                            {client.businessName}
                                        </td>
                                        <td className="p-6">
                                            <div className="font-medium text-foreground">
                                                {client.ownerName}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {client.email}
                                            </div>
                                        </td>
                                        <td className="p-6 text-muted-foreground text-xs font-medium">
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
                                                    className="h-8 text-xs bg-background border-border hover:bg-accent text-foreground rounded-xl gap-1.5"
                                                >
                                                    <ExternalLink
                                                        size={12}
                                                    />{" "}
                                                    אתר חי
                                                </Button>
                                            </Link>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-xs gap-1.5 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 bg-purple-500/5 rounded-xl font-semibold"
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
                                                    className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-2.5 gap-1"
                                                    onClick={() =>
                                                        handleDelete(
                                                            client._id,
                                                            client.businessName
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={12} /> מחק
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredClients.length === 0 && !isLoading && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-12 text-center text-muted-foreground text-sm font-medium"
                                        >
                                            לא נמצאו לקוחות. זה הזמן ללחוץ על
                                            כפתור "הרשמה" ולבצע ניסוי!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* פניות ולידים של פז (Paz Leads Inbox) */}
                <PazLeadsInbox />
            </main>
        </div>
    );
}
