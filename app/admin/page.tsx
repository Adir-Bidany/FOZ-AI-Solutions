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
    Pencil,
    X,
    Loader2,
    CheckCircle2,
    AlertCircle,
    PauseCircle,
    LayoutDashboard,
    Users,
    CreditCard,
    Zap,
    HeartPulse,
    Construction,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import GlobalHeader from "@/components/GlobalHeader";
import PazLeadsInbox from "@/components/admin/PazLeadsInbox";
import PromptCMSFAB from "@/components/admin/PromptCMSFAB";
import AdminMetricsBoard from "@/components/admin/AdminMetricsBoard";
import AdminBillingTab from "@/components/admin/AdminBillingTab";
import AdminAIUsageTab from "@/components/admin/AdminAIUsageTab";
import TierSelectDropdown from "@/components/admin/TierSelectDropdown";
import PushBroadcastAdmin from "@/components/admin/PushBroadcastAdmin";

// --- Tab Definitions ---

type AdminTab = "overview" | "tenants" | "billing" | "ai-usage" | "health";

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "מבט-על",      icon: LayoutDashboard },
    { id: "tenants",  label: "לקוחות",       icon: Users           },
    { id: "billing",  label: "כספים",        icon: CreditCard      },
    { id: "ai-usage", label: "שימוש AI",     icon: Zap             },
    { id: "health",   label: "בריאות מערכת", icon: HeartPulse      },
];

// --- Types ---

interface Client {
    _id: string;
    businessName: string;
    ownerName: string;
    email: string;
    slug: string;
    account_status?: "active" | "suspended" | "trial";
    subscription_tier?: "basic" | "pro" | "enterprise";
    createdAt: string;
    totalCustomerChats?: number;
    integrations?: {
        simplybook: boolean;
        whatsapp: boolean;
        facebook: boolean;
        instagram: boolean;
    };
}

// --- Placeholder Tab Component ---

function ComingSoonTab({ icon: Icon, label, description }: { icon: React.ElementType; label: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
                <Construction className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
                <h2 className="text-lg font-extrabold text-foreground flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5 text-purple-400" />
                    {label}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{description}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                בבנייה — בקרוב
            </span>
        </div>
    );
}

// --- Main Component ---

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<AdminTab>("tenants");
    const [clients, setClients] = useState<Client[]>([]);
    const [totalPazLeads, setTotalPazLeads] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Edit Modal State
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editForm, setEditForm] = useState({
        businessName: "",
        slug: "",
        ownerName: "",
        ownerEmail: "",
        account_status: "trial" as "active" | "suspended" | "trial",
        subscription_tier: "pro" as "basic" | "pro" | "enterprise",
    });

    // Pricing State
    const [pricingSettings, setPricingSettings] = useState<{ basic: number; pro: number; enterprise: number }>({ basic: 149, pro: 299, enterprise: 599 });

    useEffect(() => {
        fetchClients();
    }, []);

    const handleOpenEditModal = (client: Client) => {
        setEditingClient(client);
        setEditForm({
            businessName: client.businessName || "",
            slug: client.slug || "",
            ownerName: client.ownerName || "",
            ownerEmail: client.email || "",
            account_status: client.account_status || "trial",
            subscription_tier: client.subscription_tier || "pro",
        });
        setIsEditModalOpen(true);
    };

    const handleSaveTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClient) return;
        setIsSavingEdit(true);
        try {
            const res = await fetch(`/api/admin/clients/${editingClient._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            const data = await res.json();
            if (data.success) {
                setClients((prev) =>
                    prev.map((c) =>
                        c._id === editingClient._id
                            ? { ...c, businessName: editForm.businessName, slug: editForm.slug, ownerName: editForm.ownerName, email: editForm.ownerEmail, account_status: editForm.account_status, subscription_tier: editForm.subscription_tier }
                            : c
                    )
                );
                setIsEditModalOpen(false);
                setEditingClient(null);
                alert("פרטי העסק עודכנו בהצלחה!");
            } else {
                alert(data.error || "עדכון העסק נכשל");
            }
        } catch (error) {
            console.error("Update error:", error);
            alert("שגיאה בעדכון פרטי העסק");
        } finally {
            setIsSavingEdit(false);
        }
    };

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const [clientsRes, settingsRes] = await Promise.all([
                fetch("/api/admin/clients"),
                fetch("/api/admin/settings")
            ]);
            
            if (!clientsRes.ok) throw new Error("Failed to fetch clients");
            
            const clientsData = await clientsRes.json();
            if (clientsData.success) {
                setClients(clientsData.clients);
                if (clientsData.totalPazLeads !== undefined) setTotalPazLeads(clientsData.totalPazLeads);
            }

            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                if (settingsData.success && settingsData.settings?.pricing) {
                    setPricingSettings(settingsData.settings.pricing);
                }
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (clientId: string, clientName: string) => {
        if (!confirm(`האם את/ה בטוח/ה שברצונך למחוק את ${clientName}?`)) return;
        try {
            const res = await fetch(`/api/admin/clients/${clientId}`, { method: "DELETE" });
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
        const masterKeyInput = prompt(`נא להזין סיסמת מאסטר כדי להיכנס לחשבון של ${email}:`);
        if (!masterKeyInput) return;
        try {
            const result = await signIn("credentials", { email, password: masterKeyInput, redirect: false });
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
            <main className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">

                {/* Page Title */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <ShieldCheck className="text-purple-500 w-8 h-8" />
                        מרכז שליטה וניהול
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-purple-600/10 border border-purple-500/30 px-4 py-2 rounded-full text-xs md:text-sm font-bold text-foreground shadow-sm flex items-center gap-2">
                            <span>{totalPazLeads} פניות לפז</span>
                        </div>
                        <div className="bg-muted/50 border border-border px-3 py-2 rounded-full text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>{clients.length} לקוחות</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation Bar */}
                <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 border border-border rounded-2xl w-fit flex-wrap">
                    {ADMIN_TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150",
                                activeTab === id
                                    ? "bg-card shadow-sm text-foreground border border-border"
                                    : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab: Overview */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <AdminMetricsBoard clients={clients} totalPazLeads={totalPazLeads} pricing={pricingSettings} />
                        <PushBroadcastAdmin />
                    </div>
                )}

                {/* Tab: Tenants */}
                {activeTab === "tenants" && (
                    <div className="space-y-10">
                        {/* Tenant Management Table */}
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
                                            <th className="h-12 px-6 align-middle">סטטוס חשבון</th>
                                            <th className="h-12 px-6 align-middle">שם העסק</th>
                                            <th className="h-12 px-6 align-middle">בעלים</th>
                                            <th className="h-12 px-6 align-middle">תאריך הצטרפות</th>
                                            <th className="h-12 px-6 align-middle">שיחות דניאלה</th>
                                            <th className="h-12 px-6 align-middle">ממשקים</th>
                                            <th className="h-12 px-6 align-middle">פעולות מהירות</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {filteredClients.map((client) => {
                                            const status = client.account_status || "trial";
                                            return (
                                                <tr key={client._id} className="transition-colors hover:bg-muted/20">
                                                    <td className="p-6">
                                                        {status === "active" && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-full border border-emerald-500/20">
                                                                <CheckCircle2 className="w-3.5 h-3.5" /><span>פעיל</span>
                                                            </span>
                                                        )}
                                                        {status === "suspended" && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 font-bold text-xs rounded-full border border-rose-500/20">
                                                                <PauseCircle className="w-3.5 h-3.5" /><span>מושהה</span>
                                                            </span>
                                                        )}
                                                        {status === "trial" && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 font-bold text-xs rounded-full border border-amber-500/20">
                                                                <AlertCircle className="w-3.5 h-3.5" /><span>ניסיון (Trial)</span>
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-6 font-bold text-foreground">{client.businessName}</td>
                                                    <td className="p-6">
                                                        <div className="font-medium text-foreground">{client.ownerName}</div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">{client.email}</div>
                                                    </td>
                                                    <td className="p-6 text-muted-foreground text-xs font-medium">
                                                        {new Date(client.createdAt).toLocaleDateString("he-IL")}
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-300 font-bold text-xs rounded-full border border-violet-500/20 shadow-xs">
                                                            <MessageSquare className="w-3.5 h-3.5" />
                                                            <span>{client.totalCustomerChats ?? 0} שיחות</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-3">
                                                            <Link href={`/${client.slug}`} target="_blank">
                                                                <Button size="sm" variant="outline" className="h-8 text-xs bg-background border-border hover:bg-accent text-foreground rounded-xl gap-1.5">
                                                                    <ExternalLink size={12} /> אתר חי
                                                                </Button>
                                                            </Link>
                                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 rounded-xl border border-border/40">
                                                                <div title={client.integrations?.simplybook ? "SimplyBook: מחובר" : "SimplyBook: לא מחובר"} className={cn("p-1 rounded-lg transition-colors", client.integrations?.simplybook ? "text-blue-500 bg-blue-500/10" : "text-muted-foreground/30 opacity-40")}>
                                                                    <Calendar size={14} />
                                                                </div>
                                                                <div title={client.integrations?.whatsapp ? "WhatsApp: מחובר" : "WhatsApp: לא מחובר"} className={cn("p-1 rounded-lg transition-colors", client.integrations?.whatsapp ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground/30 opacity-40")}>
                                                                    <MessageSquare size={14} />
                                                                </div>
                                                                <div title={client.integrations?.facebook ? "Facebook: מחובר" : "Facebook: לא מחובר"} className={cn("p-1 rounded-lg transition-colors", client.integrations?.facebook ? "text-indigo-500 bg-indigo-500/10" : "text-muted-foreground/30 opacity-40")}>
                                                                    <Facebook size={14} />
                                                                </div>
                                                                <div title={client.integrations?.instagram ? "Instagram: מחובר" : "Instagram: לא מחובר"} className={cn("p-1 rounded-lg transition-colors", client.integrations?.instagram ? "text-pink-500 bg-pink-500/10" : "text-muted-foreground/30 opacity-40")}>
                                                                    <Instagram size={14} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 bg-purple-500/5 rounded-xl font-semibold" onClick={() => handleLoginAsClient(client.email, client.slug)}>
                                                                <LogIn size={12} /> כניסה
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="h-8 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-xl px-2.5 gap-1 font-semibold" onClick={() => handleOpenEditModal(client)} title="ערוך פרטי עסק וסטטוס חשבון">
                                                                <Pencil size={12} /> ערוך
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-2.5 gap-1" onClick={() => handleDelete(client._id, client.businessName)}>
                                                                <Trash2 size={12} /> מחק
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredClients.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan={7} className="p-12 text-center text-muted-foreground text-sm font-medium">
                                                    לא נמצאו לקוחות. זה הזמן ללחוץ על כפתור &quot;הרשמה&quot; ולבצע ניסוי!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Paz Leads Inbox */}
                        <PazLeadsInbox />
                    </div>
                )}

                {/* Tab: Billing */}
                {activeTab === "billing" && (
                    <AdminBillingTab />
                )}

                {/* Tab: AI Usage */}
                {activeTab === "ai-usage" && (
                    <AdminAIUsageTab />
                )}

                {/* Tab: System Health */}
                {activeTab === "health" && (
                    <ComingSoonTab
                        icon={HeartPulse}
                        label="בריאות מערכת"
                        description="כאן יוצגו: התראות על ניתוקי אינטגרציות, יומן פעולות אדמין מלא (Admin Audit Trail) ומצב תקינות מערכת."
                    />
                )}

            </main>

            {/* Edit Tenant Dialog Modal */}
            {isEditModalOpen && editingClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" dir="rtl">
                    <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border/80 flex items-center justify-between bg-muted/20">
                            <div>
                                <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
                                    <Pencil className="w-5 h-5 text-amber-500" />
                                    עריכת פרטי עסק וסטטוס חשבון
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{editingClient.businessName} ({editingClient.slug})</p>
                            </div>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-xl hover:bg-muted/50 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTenant} className="p-6 space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">שם העסק</label>
                                <Input value={editForm.businessName} onChange={(e) => setEditForm((prev) => ({ ...prev, businessName: e.target.value }))} placeholder="שם העסק..." required className="bg-background border-border rounded-xl text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">Slug (כתובת עמוד נחיתה)</label>
                                <Input value={editForm.slug} onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))} placeholder="slug..." required className="bg-background border-border rounded-xl text-sm font-mono dir-ltr text-right" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">שם הבעלים</label>
                                <Input value={editForm.ownerName} onChange={(e) => setEditForm((prev) => ({ ...prev, ownerName: e.target.value }))} placeholder="שם הבעלים..." required className="bg-background border-border rounded-xl text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">אימייל הבעלים</label>
                                <Input type="email" value={editForm.ownerEmail} onChange={(e) => setEditForm((prev) => ({ ...prev, ownerEmail: e.target.value }))} placeholder="email@example.com..." required className="bg-background border-border rounded-xl text-sm dir-ltr text-right" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-foreground">סטטוס חשבון (Account Status)</label>
                                <select value={editForm.account_status} onChange={(e) => setEditForm((prev) => ({ ...prev, account_status: e.target.value as "active" | "suspended" | "trial" }))} className="w-full bg-background border border-border text-foreground rounded-xl p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500">
                                    <option value="active">🟢 פעיל (Active Subscription)</option>
                                    <option value="trial">🟡 ניסיון (Trial Period)</option>
                                    <option value="suspended">🔴 מושהה (Suspended Account)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5 p-4 border border-amber-500/30 bg-amber-500/5 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-xs font-bold text-foreground">טייר מנוי (Subscription Tier)</label>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">שינוי כאן מגדיר את הלקוח כקבוע ומבטל את מגבלת 14-יום (Free Trial).</p>
                                    </div>
                                    <div className="w-40">
                                        <TierSelectDropdown 
                                            businessId={editingClient._id} 
                                            currentTier={editForm.subscription_tier} 
                                            onSuccess={(newTier) => {
                                                setEditForm(prev => ({ ...prev, subscription_tier: newTier }));
                                                setClients(prev => prev.map(c => c._id === editingClient._id ? { ...c, subscription_tier: newTier } : c));
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="rounded-xl text-xs font-bold">ביטול</Button>
                                <Button type="submit" disabled={isSavingEdit} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold gap-2">
                                    {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                                    שמור שינויים
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Prompt CMS Floating Action Button */}
            <PromptCMSFAB />
        </div>
    );
}