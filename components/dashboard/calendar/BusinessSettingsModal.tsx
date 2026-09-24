"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface BusinessSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId?: string; // Optional, might fetch from context/session in real app
}

export default function BusinessSettingsModal({ isOpen, onClose }: BusinessSettingsModalProps) {
    const [hasServices, setHasServices] = useState(false);
    const [policies, setPolicies] = useState<string[]>([]);
    const [newPolicy, setNewPolicy] = useState("");
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
                    setPolicies(data.settings.policies || []);
                }
            })
            .catch(() => toast.error("שגיאה בטעינת ההגדרות"))
            .finally(() => setIsLoading(false));
    }, [isOpen]);

    const handleAddPolicy = () => {
        if (newPolicy.trim().length > 0) {
            setPolicies([...policies, newPolicy.trim()]);
            setNewPolicy("");
        }
    };

    const handleRemovePolicy = (index: number) => {
        setPolicies(policies.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/business/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hasServices, policies }),
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
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle>הגדרות עסק</DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <>
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

                            <div className="rounded-lg border p-4 space-y-4">
                                <div className="space-y-1">
                                    <Label className="text-base font-bold text-foreground">תנאי שירות ומדיניות</Label>
                                    <p className="text-sm text-muted-foreground">
                                        יופיעו בתחתית עמוד הנחיתה ואזור הלקוחות (לדוגמה: מדיניות ביטולים).
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    {policies.map((policy, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
                                            <span className="flex-1 text-sm text-foreground">{policy}</span>
                                            <button 
                                                onClick={() => handleRemovePolicy(index)}
                                                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {policies.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">אין תנאי שירות מוגדרים.</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Input
                                        placeholder="תנאי שירות ומדיניות (עד 15 מילים)..."
                                        value={newPolicy}
                                        onChange={(e) => setNewPolicy(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddPolicy()}
                                        className="flex-1"
                                    />
                                    <Button type="button" variant="secondary" size="icon" onClick={handleAddPolicy} className="shrink-0">
                                        <Plus size={16} />
                                    </Button>
                                </div>
                            </div>
                        </>
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
