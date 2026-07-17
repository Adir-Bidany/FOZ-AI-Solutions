"use client";

import React, { useState, useEffect } from "react";
import { Users, CheckCircle, Trash2, Eye, UserX, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        <div className="p-8 max-w-6xl mx-auto space-y-8" dir="rtl">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                <Users className="text-purple-600" />
                ניהול לקוחות (CRM)
            </h1>

            {loading ? (
                <div className="text-gray-500">טוען נתונים...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Pending Approvals Table */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-amber-500 w-5 h-5" />
                            ממתינים לאישור ({pendingCustomers.length})
                        </h2>
                        {pendingCustomers.length === 0 ? (
                            <p className="text-gray-500 text-sm">אין לקוחות הממתינים לאישור.</p>
                        ) : (
                            <div className="space-y-3">
                                {pendingCustomers.map(c => (
                                    <div key={c._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold">{c.name} {c.lastName}</p>
                                            <p className="text-xs text-gray-500">{c.phone} | {c.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(c._id)}>
                                                אשר
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(c._id)}>
                                                מחק
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Active Customers Table */}
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Users className="text-indigo-500 w-5 h-5" />
                            לקוחות פעילים ({activeCustomers.length})
                        </h2>
                        {activeCustomers.length === 0 ? (
                            <p className="text-gray-500 text-sm">אין לקוחות פעילים.</p>
                        ) : (
                            <div className="space-y-3">
                                {activeCustomers.map(c => (
                                    <div key={c._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-semibold">{c.name} {c.lastName}</p>
                                            <p className="text-xs text-gray-500">{c.phone}</p>
                                        </div>
                                        <Button size="sm" variant="outline" className="flex gap-1" onClick={() => {
                                            setSelectedCustomer(c);
                                            setIsDeleting(false);
                                        }}>
                                            <Eye className="w-4 h-4" /> פרופיל
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                        <button onClick={() => setSelectedCustomer(null)} className="absolute top-4 left-4 text-gray-400 hover:text-black">✕</button>
                        
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedCustomer.name} {selectedCustomer.lastName}</h2>
                            <p className="text-sm text-gray-500">{selectedCustomer.email} | {selectedCustomer.phone}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-lg text-center border">
                                <p className="text-xs text-gray-500">הכנסות מלקוח</p>
                                <p className="font-bold text-lg text-green-600">₪{selectedCustomer.metrics?.totalRevenue || 0}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg text-center border">
                                <p className="text-xs text-gray-500">מספר טיפולים</p>
                                <p className="font-bold text-lg text-indigo-600">{selectedCustomer.metrics?.totalAppointments || 0}</p>
                            </div>
                        </div>

                        {/* Double-Check Deletion Gate */}
                        {!isDeleting ? (
                            <Button 
                                variant="destructive" 
                                className="w-full flex gap-2" 
                                onClick={() => setIsDeleting(true)}
                            >
                                <UserX className="w-4 h-4" /> מחק לקוח
                            </Button>
                        ) : (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <h3 className="font-bold text-red-700 mb-1">האם אתה בטוח?</h3>
                                <p className="text-sm text-red-600 mb-4">מחיקת הלקוח תסיר אותו ואת כל נתוניו מהמערכת לצמיתות.</p>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 border-gray-300"
                                        onClick={() => setIsDeleting(false)}
                                    >
                                        לא למחוק
                                    </Button>
                                    <Button 
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
        </div>
    );
}
