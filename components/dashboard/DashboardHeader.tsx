"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface DashboardHeaderProps {
    greeting: string;
    ownerName: string;
    clientSlug: string;
    clientData: any; // For Sidebar
}

export default function DashboardHeader({
    greeting,
    ownerName,
    clientSlug,
    clientData,
}: DashboardHeaderProps) {
    // Poll every 5 seconds
    const { data, error } = useSWR("/api/dashboard/stats", fetcher, {
        refreshInterval: 5000,
    });

    const dailyCount = data?.dailyCount ?? 0;

    return (
        <>
            {/* Stats & Actions Bar */}
            <div className="mb-8 bg-gray-900 rounded-xl p-4 flex items-center justify-between shadow-md text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <MessageSquare size={20} className="text-white" />
                    </div>
                    <div>
                        <div className="text-sm text-gray-400 font-medium">
                            שיחות שהתחילו
                        </div>
                        <div className="text-xl font-bold">
                            {data ? dailyCount : "..."}
                        </div>
                    </div>
                </div>

                <Link href={`/c/${clientSlug}`} target="_blank">
                    <Button
                        variant="secondary"
                        className="h-10 gap-2 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-medium"
                    >
                        <LinkIcon size={16} /> צפה באתר שלי
                    </Button>
                </Link>
            </div>
        </>
    );
}
