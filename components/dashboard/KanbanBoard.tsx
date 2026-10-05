"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Phone, Calendar, CheckCircle2, UserPlus, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type PipelineStatus = "New" | "Contacted" | "Meeting Set" | "Closed";

interface Lead {
    _id: string;
    name: string;
    lastName: string;
    phone: string;
    pipeline_status: PipelineStatus;
    createdAt: string;
}

const COLUMNS: { id: PipelineStatus; title: string; icon: React.ReactNode; color: string }[] = [
    { id: "New", title: "ליד חדש", icon: <UserPlus className="w-5 h-5" />, color: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400" },
    { id: "Contacted", title: "נוצר קשר", icon: <Phone className="w-5 h-5" />, color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
    { id: "Meeting Set", title: "נקבעה פגישה", icon: <Calendar className="w-5 h-5" />, color: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400" },
    { id: "Closed", title: "נסגר/טופל", icon: <CheckCircle2 className="w-5 h-5" />, color: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400" }
];

export default function KanbanBoard() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/business/customers");
            const data = await res.json();
            if (data.success) {
                // Ensure default status is set
                const formattedLeads = data.customers.map((c: any) => ({
                    ...c,
                    pipeline_status: c.pipeline_status || "New"
                }));
                setLeads(formattedLeads);
            }
        } catch (error) {
            toast.error("שגיאה בטעינת הלידים");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, leadId: string) => {
        setDraggedLeadId(leadId);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image styling workaround for HTML5
        const dt = e.dataTransfer;
        if (dt.setDragImage) {
            const el = document.getElementById(`lead-card-${leadId}`);
            if (el) dt.setDragImage(el, 20, 20);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: PipelineStatus) => {
        e.preventDefault();
        if (!draggedLeadId) return;

        const currentLead = leads.find((l) => l._id === draggedLeadId);
        if (!currentLead || currentLead.pipeline_status === targetStatus) {
            setDraggedLeadId(null);
            return;
        }

        // Optimistic UI update
        const originalLeads = [...leads];
        setLeads(leads.map((l) => (l._id === draggedLeadId ? { ...l, pipeline_status: targetStatus } : l)));
        setDraggedLeadId(null);

        // API update
        try {
            const res = await fetch("/api/business/pipeline/move", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ customerId: draggedLeadId, newStatus: targetStatus }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error("API failed");
            }
        } catch (error) {
            toast.error("שגיאה בעדכון הסטטוס");
            setLeads(originalLeads); // Revert on failure
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4" dir="rtl" style={{ minHeight: "65vh" }}>
            {COLUMNS.map((col) => {
                const columnLeads = leads.filter((l) => l.pipeline_status === col.id);
                
                return (
                    <div 
                        key={col.id} 
                        className="flex flex-col min-w-[280px] w-full max-w-[320px] bg-muted/20 border border-border rounded-2xl p-4 shrink-0"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col.id)}
                    >
                        {/* Column Header */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-4 ${col.color}`}>
                            {col.icon}
                            <h3 className="font-bold">{col.title}</h3>
                            <span className="bg-background/80 text-foreground px-2 py-0.5 rounded-full text-xs font-bold mr-auto shadow-sm">
                                {columnLeads.length}
                            </span>
                        </div>

                        {/* Drop Zone / Cards */}
                        <div className="flex flex-col gap-3 flex-1 min-h-[150px]">
                            {columnLeads.map((lead) => (
                                <div
                                    key={lead._id}
                                    id={`lead-card-${lead._id}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead._id)}
                                    className={`bg-card border border-border shadow-sm rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${draggedLeadId === lead._id ? 'opacity-50 ring-2 ring-primary ring-offset-1' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-foreground">
                                            {lead.name} {lead.lastName}
                                        </div>
                                        <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                    </div>
                                    <div className="text-sm text-muted-foreground mb-3">
                                        {lead.phone}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex justify-between items-center bg-muted/40 p-2 rounded-lg">
                                        <span>נוצר ב:</span>
                                        <span className="font-medium">{format(new Date(lead.createdAt), "dd/MM HH:mm")}</span>
                                    </div>
                                </div>
                            ))}
                            
                            {columnLeads.length === 0 && (
                                <div className="flex-1 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-muted-foreground/50 text-sm italic">
                                    גרור לידים לכאן
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
