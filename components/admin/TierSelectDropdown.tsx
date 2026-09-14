"use client";

import React, { useState } from "react";
import { type SubscriptionTier, SUBSCRIPTION_TIERS } from "@/lib/config/tiers";
import { toast } from "sonner";

interface TierSelectDropdownProps {
    businessId: string;
    currentTier: SubscriptionTier;
    onSuccess?: (newTier: SubscriptionTier) => void;
}

export default function TierSelectDropdown({ businessId, currentTier, onSuccess }: TierSelectDropdownProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [tier, setTier] = useState<SubscriptionTier>(currentTier);

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTier = e.target.value as SubscriptionTier;
        setTier(newTier);
        setIsLoading(true);

        try {
            const res = await fetch("/api/admin/businesses/tier", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId, tier: newTier }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success(`שודרג בהצלחה לחבילת ${SUBSCRIPTION_TIERS[newTier].label} (הגדרת קבע)`);
                if (onSuccess) onSuccess(newTier);
            } else {
                throw new Error(data.error || "שגיאה בעדכון חבילה");
            }
        } catch (error: any) {
            toast.error(error.message || "שגיאה בעדכון חבילה");
            setTier(currentTier); // revert
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <select
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted"
            value={tier}
            onChange={handleChange}
            disabled={isLoading}
        >
            <option value="basic">Basic (בסיסי)</option>
            <option value="pro">Pro (מתקדם)</option>
            <option value="enterprise">Enterprise (ארגוני)</option>
        </select>
    );
}