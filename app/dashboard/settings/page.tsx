"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Loader2,
    Save,
    Building2,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        phone: "",
        address: "",
        description: "",
    });

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/business/settings");
                const result = await res.json();
                if (result.success && result.data) {
                    setFormData({
                        businessName: result.data.businessName || "",
                        ownerName: result.data.ownerName || "",
                        phone: result.data.phone || "",
                        address: result.data.address || "",
                        description: result.data.description || "",
                    });
                }
            } catch (error) {
                console.error("Failed to load settings:", error);
                toast.error("שגיאה בטעינת ההגדרות");
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/business/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("הפרטים נשמרו בהצלחה!");
            } else {
                toast.error("שגיאה בשמירה");
            }
        } catch (error) {
            console.error(error);
            toast.error("תקלה בתקשורת");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    הגדרות פרופיל
                </h1>
                <p className="text-muted-foreground mt-1">
                    ניהול פרטי העסק והעדפות אישיות
                </p>
            </div>

            <Card className="bg-card border-border shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <CardTitle>פרטי העסק</CardTitle>
                            <CardDescription>
                                המידע שיופיע ללקוחות ולצוות הדיגיטלי
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>שם העסק</Label>
                            <Input
                                value={formData.businessName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        businessName: e.target.value,
                                    })
                                }
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>שם בעל/ת העסק</Label>
                            <Input
                                value={formData.ownerName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        ownerName: e.target.value,
                                    })
                                }
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>טלפון לעסקים</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        phone: e.target.value,
                                    })
                                }
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>כתובת העסק</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        address: e.target.value,
                                    })
                                }
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>תיאור העסק</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            className="min-h-[100px] rounded-xl resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-sm gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Save size={18} />
                    )}
                    שמור שינויים
                </Button>
            </div>
        </div>
    );
}
