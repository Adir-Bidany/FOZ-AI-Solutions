"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { fetchGuestChats, type ChatSession } from "@/actions/dashboard";
import SharedChatInboxUI from "@/components/dashboard/SharedChatInboxUI";

interface GuestChatsSectionProps {
    businessId: string;
}

export default function GuestChatsSection({ businessId }: GuestChatsSectionProps) {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGuestChats()
            .then(setSessions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [businessId]);

    return (
        <SharedChatInboxUI
            title="שיחות עם לקוחות מזדמנים"
            description="אורחים שפנו דרך הצ׳אט ללא התחברות"
            icon={<Users className="w-4 h-4" />}
            agentName="דניאלה"
            sessions={sessions}
            loading={loading}
            emptyStateTitle="אין שיחות עם אורחים"
            emptyStateDescription="כאשר מבקרים יפנו דרך הצ׳אט ללא התחברות, השיחות יופיעו כאן."
            accentColor="violet"
        />
    );
}
