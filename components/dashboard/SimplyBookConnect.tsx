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
import { Loader2, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SimplyBookConnect() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [keys, setKeys] = useState({
        companyLogin: "",
        apiKey: "",
    });

    const handleIntegrationSave = async () => {
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
                // Force refresh to reload parent page and show the calendar logic
                router.refresh();
            } else {
                toast.error("שגיאה בחיבור", { description: data.error });
            }
        } catch (err) {
            console.error(err);
            toast.error("תקלה בתקשורת");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden max-w-2xl mx-auto mt-10" dir="rtl">
            <CardHeader className="border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
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
            <CardContent className="p-6 space-y-4">
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
                        placeholder="לדוגמה: mayaclinic"
                        value={keys.companyLogin}
                        autoComplete="off"
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
                        placeholder="הדביקי כאן את המפתח"
                        value={keys.apiKey}
                        autoComplete="new-password"
                        onChange={(e) =>
                            setKeys({ ...keys, apiKey: e.target.value })
                        }
                        className="h-10 rounded-xl"
                    />
                </div>

                <Button
                    onClick={handleIntegrationSave}
                    className="w-full mt-4 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white shadow-md"
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
    );
}
