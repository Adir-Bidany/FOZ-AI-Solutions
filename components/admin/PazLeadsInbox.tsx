"use client";

import React, { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { fetchPazLeads, type ChatSession } from "@/actions/dashboard";
import SharedChatInboxUI from "@/components/dashboard/SharedChatInboxUI";

export default function PazLeadsInbox() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPazLeads()
            .then(setSessions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <SharedChatInboxUI
            title="פניות ולידים של פז (FOZ AI)"
            description="שיחות שנוהלו בעמוד הבית ע״י פז עם מתעניינים ורוכשים פוטנציאליים"
            icon={<Sparkles className="w-4 h-4 text-purple-400" />}
            badgeText="FOZ AI SaaS"
            agentName="פז (FOZ AI)"
            sessions={sessions}
            loading={loading}
            emptyStateTitle="אין פניות חדשות לפז"
            emptyStateDescription="כאשר מתעניינים יפנו דרך הצ׳אט בעמוד הבית, השיחות יופיעו כאן."
            accentColor="purple"
        />
    );
}
