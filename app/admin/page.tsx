"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ShieldCheck,
    ExternalLink,
    LogIn,
    Search,
    Trash2,
    Calendar,
    MessageSquare,
    Facebook,
    Instagram,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import GlobalHeader from "@/components/GlobalHeader";
import PazLeadsInbox from "@/components/admin/PazLeadsInbox";

interface Client {
    _id: string;
    businessName: string;
    ownerName: string;
    email: string;
    slug: string;
    createdAt: string;
    totalCustomerChats?: number;
    integrations?: {
        simplybook: boolean;
        whatsapp: boolean;
        facebook: boolean;
        instagram: boolean;
    };
}

export default function AdminDashboard() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [totalPazLeads, setTotalPazLeads] = useState<number>(0);
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
                if (data.totalPazLeads !== undefined) {
                    setTotalPazLeads(data.totalPazLeads);
                }
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
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-purple-600/10 border border-purple-500/30 px-4 py-2 rounded-full text-xs md:text-sm font-bold text-foreground shadow-sm flex items-center gap-2">                      
                            <span>{totalPazLeads} פניות לפז</span>
                        </div>
                    </div>
                </div>

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
                                        שיחות דניאלה
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
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold text-xs rounded-full border border-violet-500/20 shadow-xs">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                <span>{client.totalCustomerChats ?? 0} שיחות</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/${client.slug}`}
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

                                                {/* Integration Status Badges */}
                                                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-xl border border-border/40">
                                                    {/* SimplyBook / Calendar */}
                                                    <div
                                                        title={client.integrations?.simplybook ? "SimplyBook: מחובר" : "SimplyBook: לא מחובר"}
                                                        className={cn(
                                                            "p-1 rounded-lg transition-colors",
                                                            client.integrations?.simplybook
                                                                ? "text-blue-500 bg-blue-500/10"
                                                                : "text-muted-foreground/30 opacity-40"
                                                        )}
                                                    >
                                                        <Calendar size={14} />
                                                    </div>

                                                    {/* WhatsApp */}
                                                    <div
                                                        title={client.integrations?.whatsapp ? "WhatsApp: מחובר" : "WhatsApp: לא מחובר"}
                                                        className={cn(
                                                            "p-1 rounded-lg transition-colors",
                                                            client.integrations?.whatsapp
                                                                ? "text-emerald-500 bg-emerald-500/10"
                                                                : "text-muted-foreground/30 opacity-40"
                                                        )}
                                                    >
                                                        <MessageSquare size={14} />
                                                    </div>

                                                    {/* Facebook */}
                                                    <div
                                                        title={client.integrations?.facebook ? "Facebook: מחובר" : "Facebook: לא מחובר"}
                                                        className={cn(
                                                            "p-1 rounded-lg transition-colors",
                                                            client.integrations?.facebook
                                                                ? "text-indigo-500 bg-indigo-500/10"
                                                                : "text-muted-foreground/30 opacity-40"
                                                        )}
                                                    >
                                                        <Facebook size={14} />
                                                    </div>

                                                    {/* Instagram */}
                                                    <div
                                                        title={client.integrations?.instagram ? "Instagram: מחובר" : "Instagram: לא מחובר"}
                                                        className={cn(
                                                            "p-1 rounded-lg transition-colors",
                                                            client.integrations?.instagram
                                                                ? "text-pink-500 bg-pink-500/10"
                                                                : "text-muted-foreground/30 opacity-40"
                                                        )}
                                                    >
                                                        <Instagram size={14} />
                                                    </div>
                                                </div>
                                            </div>
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
