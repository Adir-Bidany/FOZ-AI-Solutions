"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Users, Lock } from "lucide-react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import FeatureGate from "@/components/dashboard/FeatureGate";
import { type SubscriptionTier } from "@/lib/config/tiers";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnalyticsSection() {
    const { data: session } = useSession();
    const effectiveTier = (session?.user?.effectiveTier as SubscriptionTier) ?? "basic";

    // Fetch total leads
    const { data, error } = useSWR(`/api/business/customers`, fetcher);

    const handleExport = () => {
        if (!data || !data.customers) {
            toast.error("אין נתונים לייצוא");
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Name,Phone,Status,Created At\n"
            + data.customers.map((c: any) => `${c.name} ${c.lastName},${c.phone},${c.pipeline_status || 'New'},${c.createdAt}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mt-12 flex justify-end">
            <Card className="border-border/50 shadow-sm bg-card rounded-2xl w-full max-w-lg">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">סה״כ לידים במערכת</p>
                            <p className="text-2xl font-bold text-foreground">
                                {data?.customers ? data.customers.length : "..."}
                            </p>
                        </div>
                    </div>
                    
                    <FeatureGate
                        currentTier={effectiveTier}
                        requiredFeature="CSV_EXPORT"
                        fallback={
                            <Button disabled className="h-10 rounded-xl bg-muted text-muted-foreground gap-2 cursor-not-allowed">
                                <Lock size={16} /> ייצוא ל-CSV (Enterprise)
                            </Button>
                        }
                    >
                        <Button onClick={handleExport} variant="outline" className="h-10 rounded-xl gap-2 hover:bg-primary/5 border-primary/20">
                            <Download size={16} /> ייצוא נתונים (CSV)
                        </Button>
                    </FeatureGate>
                </CardContent>
            </Card>
        </div>
    );
}
