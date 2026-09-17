"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BusinessSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId?: string; // Optional, might fetch from context/session in real app
}

export default function BusinessSettingsModal({ isOpen, onClose }: BusinessSettingsModalProps) {
    const [hasServices, setHasServices] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch initial settings
    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        fetch("/api/business/settings")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings) {
                    setHasServices(!!data.settings.hasServices);
                }
            })
            .catch(() => toast.error("שגיאה בטעינת ההגדרות"))
            .finally(() => setIsLoading(false));
    }, [isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/business/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hasServices }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("ההגדרות נשמרו בהצלחה");
                onClose();
            } else {
                toast.error(data.error || "שגיאה בשמירת ההגדרות");
            }
        } catch (error) {
            toast.error("שגיאה בשמירת ההגדרות");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>הגדרות עסק</DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-between space-x-4 space-x-reverse rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base font-bold text-foreground">סוגי טיפולים מרובים</Label>
                                <p className="text-sm text-muted-foreground">
                                    האם העסק מציע מספר סוגי טיפולים או שירותים לבחירת הלקוח? (ישפיע על השאלות של דניאלה)
                                </p>
                            </div>
                            <Switch
                                checked={hasServices}
                                onCheckedChange={setHasServices}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        ביטול
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || isLoading}>
                        {isSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : null}
                        שמור שינויים
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
