"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function SimplyBookPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [keys, setKeys] = useState({
        companyLogin: "",
        apiKey: "",
    });

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/settings/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(keys),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("היומן חובר בהצלחה!");
            } else {
                toast.error("שגיאה בחיבור", { description: data.error });
            }
        } catch (error) {
            toast.error("תקלה בתקשורת");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto" dir="rtl">
            <h1 className="text-2xl font-bold mb-6">חיבור יומן</h1>

            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <CardTitle>חיבור ליומן SimplyBook</CardTitle>
                            <CardDescription>
                                כדי שהבוט יוכל לראות תורים, עלייך לחבר את חשבון
                                ה-SimplyBook שלך.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex gap-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0" />
                        <div>
                            <strong>איפה מוצאים את הפרטים?</strong>
                            <br />
                            באתר SimplyBook, לכי ל: Custom Features -{">"} API -
                            {">"} Settings.
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>שם החברה (Company Login)</Label>
                        <Input
                            placeholder="למשל: mayaclinic"
                            value={keys.companyLogin}
                            onChange={(e) =>
                                setKeys({
                                    ...keys,
                                    companyLogin: e.target.value,
                                })
                            }
                            className="h-10 rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>מפתח API (API Key)</Label>
                        <Input
                            type="password"
                            placeholder="הדביקי כאן את המפתח הארוך..."
                            value={keys.apiKey}
                            onChange={(e) =>
                                setKeys({ ...keys, apiKey: e.target.value })
                            }
                            className="h-10 rounded-xl"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        className="w-full mt-4 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="ml-2 animate-spin" />
                        ) : (
                            <CheckCircle2 className="ml-2" />
                        )}
                        שמור וחיבור
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
