"use client";

import { Button } from "@/components/ui/button";
import { Unplug, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CalendarHeaderActions() {
    const router = useRouter();
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            const res = await fetch("/api/settings/integrations", {
                method: "DELETE"
            });
            const data = await res.json();
            
            if (data.success) {
                toast.success("היומן נותק בהצלחה");
                router.refresh();
            } else {
                toast.error("שגיאה בניתוק היומן");
            }
        } catch (error) {
            toast.error("תקלה בתקשורת");
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
            onClick={handleDisconnect}
            disabled={isDisconnecting}
        >
            {isDisconnecting ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
                <Unplug className="w-4 h-4 ml-2" />
            )}
            נתק יומן
        </Button>
    );
}
