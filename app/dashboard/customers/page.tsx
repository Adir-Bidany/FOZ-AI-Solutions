"use client";

import React, { useState, useEffect } from "react";
import { Users, CheckCircle, Eye, UserX, AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerChatModal from "@/components/dashboard/CustomerChatModal";
import GuestChatsSection from "@/components/dashboard/GuestChatsSection";

interface Customer {
    _id: string;
    name: string;
    lastName: string;
    phone: string;
    email: string;
    status: "pending" | "approved";
    metrics?: {
        totalRevenue?: number;
        totalAppointments?: number;
    };
}

interface ChatTarget {
    _id: string;
    name: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Chat modal state
    const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);

    // Business ID for GuestChatsSection (populated from session via API response)
    const [businessId, setBusinessId] = useState<string>("");

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/business/customers");
            const data = await res.json();
            if (data.success) {
                setCustomers(data.customers);
                if (data.businessId) setBusinessId(data.businessId);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/business/customers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "approved" })
            });
            if (res.ok) {
                setCustomers((prev) => prev.map(c => c._id === id ? { ...c, status: "approved" } : c));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/business/customers/${id}`, { method: "DELETE" });
            if (res.ok) {
                setCustomers((prev) => prev.filter(c => c._id !== id));
                if (selectedCustomer?._id === id) {
                    setSelectedCustomer(null);
                    setIsDeleting(false);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const pendingCustomers = customers.filter(c => c.status === "pending");
    const activeCustomers = customers.filter(c => c.status === "approved");

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10" dir="rtl">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-foreground">
                <Users className="text-purple-600" />
                ניהול לקוחות (CRM)
            </h1>

            {loading ? (
                <div className="text-muted-foreground">טוען נתונים...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Pending Approvals Table */}
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <CheckCircle className="text-amber-500 w-5 h-5" />
                                ממתינים לאישור ({pendingCustomers.length})
                            </h2>
                            {pendingCustomers.length === 0 ? (
                                <p className="text-muted-foreground text-sm">אין לקוחות הממתינים לאישור.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pendingCustomers.map(c => (
                                        <div key={c._id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div>
                                                <p className="font-semibold text-foreground">{c.name} {c.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{c.phone} | {c.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    id={`approve-customer-${c._id}`}
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleApprove(c._id)}
                                                >
                                                    אשר
                                                </Button>
                                                <Button
                                                    id={`delete-pending-${c._id}`}
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(c._id)}
                                                >
                                                    מחק
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active Customers Table */}
                        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <Users className="text-indigo-500 w-5 h-5" />
                                לקוחות פעילים ({activeCustomers.length})
                            </h2>
                            {activeCustomers.length === 0 ? (
                                <p className="text-muted-foreground text-sm">אין לקוחות פעילים.</p>
                            ) : (
                                <div className="space-y-3">
                                    {activeCustomers.map(c => (
                                        <div key={c._id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div>
                                                <p className="font-semibold text-foreground">{c.name} {c.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{c.phone}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {/* ── Chat History Button ── */}
                                                <Button
                                                    id={`view-chat-${c._id}`}
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex gap-1.5 border-violet-300 text-violet-600 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-950/40"
                                                    onClick={() => setChatTarget({ _id: c._id, name: `${c.name} ${c.lastName}` })}
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                    צ׳אט
                                                </Button>
                                                {/* ── Profile Button ── */}
                                                <Button
                                                    id={`view-profile-${c._id}`}
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex gap-1"
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setIsDeleting(false);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4" /> פרופיל
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── Guest Chats Section ─── */}
                    <GuestChatsSection businessId={businessId} />
                </>
            )}

            {/* ─── Profile Modal ─── */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-border">
                        <button
                            id="close-profile-modal"
                            onClick={() => setSelectedCustomer(null)}
                            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground"
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">{selectedCustomer.name} {selectedCustomer.lastName}</h2>
                            <p className="text-sm text-muted-foreground">{selectedCustomer.email} | {selectedCustomer.phone}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-muted/40 p-3 rounded-lg text-center border border-border">
                                <p className="text-xs text-muted-foreground">הכנסות מלקוח</p>
                                <p className="font-bold text-lg text-green-600">₪{selectedCustomer.metrics?.totalRevenue || 0}</p>
                            </div>
                            <div className="bg-muted/40 p-3 rounded-lg text-center border border-border">
                                <p className="text-xs text-muted-foreground">מספר טיפולים</p>
                                <p className="font-bold text-lg text-indigo-600">{selectedCustomer.metrics?.totalAppointments || 0}</p>
                            </div>
                        </div>

                        {!isDeleting ? (
                            <Button
                                id="initiate-delete-customer"
                                variant="destructive"
                                className="w-full flex gap-2"
                                onClick={() => setIsDeleting(true)}
                            >
                                <UserX className="w-4 h-4" /> מחק לקוח
                            </Button>
                        ) : (
                            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <h3 className="font-bold text-red-700 dark:text-red-400 mb-1">האם אתה בטוח?</h3>
                                <p className="text-sm text-red-600 dark:text-red-400 mb-4">מחיקת הלקוח תסיר אותו ואת כל נתוניו מהמערכת לצמיתות.</p>
                                <div className="flex gap-3">
                                    <Button
                                        id="cancel-delete-customer"
                                        variant="outline"
                                        className="flex-1 border-gray-300"
                                        onClick={() => setIsDeleting(false)}
                                    >
                                        לא למחוק
                                    </Button>
                                    <Button
                                        id="confirm-delete-customer"
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleDelete(selectedCustomer._id)}
                                    >
                                        אישור מחיקה
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ─── Customer Chat History Modal ─── */}
            <CustomerChatModal
                isOpen={chatTarget !== null}
                onClose={() => setChatTarget(null)}
                customerId={chatTarget?._id ?? ""}
                customerName={chatTarget?.name ?? ""}
            />
        </div>
    );
}
