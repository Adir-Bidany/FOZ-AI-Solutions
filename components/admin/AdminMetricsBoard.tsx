import React from "react";
import { Banknote, Users, MessageSquare, Blocks } from "lucide-react";

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

interface AdminMetricsBoardProps {
    clients: Client[];
    totalPazLeads: number;
    pricing: { basic: number; pro: number; enterprise: number };
}

export default function AdminMetricsBoard({ clients, totalPazLeads, pricing }: AdminMetricsBoardProps) {
    const activeClients = clients.filter((c) => c.account_status === "active");
    const activeClientsCount = activeClients.length;
    
    const estimatedMRR = activeClients.reduce((sum, client) => {
        const tier = client.subscription_tier || "pro";
        return sum + (pricing[tier] || 0);
    }, 0);
    
    const totalAIChats = clients.reduce((sum, c) => sum + (c.totalCustomerChats || 0), 0) + totalPazLeads;
    
    let connectedIntegrations = 0;
    clients.forEach((c) => {
        if (c.integrations?.simplybook) connectedIntegrations++;
        if (c.integrations?.whatsapp) connectedIntegrations++;
        if (c.integrations?.facebook) connectedIntegrations++;
        if (c.integrations?.instagram) connectedIntegrations++;
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full" dir="rtl">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">MRR (הכנסות)</span>
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <Banknote className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground">
                        ₪{estimatedMRR.toLocaleString("he-IL")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        הכנסה חודשית קבועה (מוערך)
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">לקוחות מערכת</span>
                    <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
                        <Users className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground">
                        {activeClientsCount} <span className="text-lg text-muted-foreground font-medium">/ {clients.length}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        לקוחות פעילים מתוך סך הכל
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">פעילות מערכת (שיחות)</span>
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-500">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground">
                        {totalAIChats.toLocaleString("he-IL")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        סה״כ שיחות AI במערכת
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground">ממשקים פעילים</span>
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
                        <Blocks className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <div className="text-2xl md:text-3xl font-extrabold text-foreground">
                        {connectedIntegrations.toLocaleString("he-IL")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        ממשקים מחוברים (WhatsApp, וכו׳)
                    </div>
                </div>
            </div>
        </div>
    );
}