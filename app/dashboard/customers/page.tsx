"use client";

import React, { useState, useEffect } from "react";
import { Users, CheckCircle, Eye, UserX, AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerChatModal from "@/components/dashboard/CustomerChatModal";
import Customer360Modal from '@/components/dashboard/Customer360Modal';
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

            {/* Customer 360 Modal */}
            <Customer360Modal isOpen={selectedCustomer !== null} onClose={() => setSelectedCustomer(null)} customerId={selectedCustomer?._id ?? ''} onDelete={handleDelete} />

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
