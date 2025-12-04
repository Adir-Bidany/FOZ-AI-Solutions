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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, User, Building2, Phone, FileText, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        phone: "",
        address: "",
        description: "",
        persona: "golda",
    });
    const [keys, setKeys] = useState({
        companyLogin: "",
        apiKey: "",
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
                        persona: result.data.persona || "golda",
                    });
                    if (result.data.apiKeys) {
                        setKeys({
                            companyLogin: result.data.apiKeys.companyLogin || "",
                            apiKey: result.data.apiKeys.apiKey || "",
                        });
                    }
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
        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">הגדרות פרופיל</h1>
                <p className="text-gray-500 mt-1">ניהול פרטי העסק והעדפות אישיות</p>
            </div>

            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <CardTitle>פרטי העסק</CardTitle>
                            <CardDescription>המידע שיופיע ללקוחות ולצוות הדיגיטלי</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>שם העסק</Label>
                            <Input
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>שם בעל/ת העסק</Label>
                            <Input
                                value={formData.ownerName}
                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>טלפון לעסקים</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="h-10 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>כתובת הקליניקה</Label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="h-10 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>תיאור העסק</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[100px] rounded-xl resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                            <User size={20} />
                        </div>
                        <div>
                            <CardTitle>הגדרות פרסונה (AI Manager)</CardTitle>
                            <CardDescription>בחרי את סגנון הניהול של המנהל הדיגיטלי שלך</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-2 max-w-md">
                        <Label>בחר מנהל</Label>
                        <Select
                            value={formData.persona}
                            onValueChange={(value) => setFormData({ ...formData, persona: value })}
                        >
                            <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="בחר פרסונה" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="golda">גולדה (אסרטיבית ומנוסה)</SelectItem>
                                <SelectItem value="david">דוד (אנליטי ורגוע)</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-gray-500 mt-2">
                            * השינוי ישפיע על אופן התקשורת של הבוט בחדר המצב.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
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

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="h-12 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    שמור שינויים
                </Button>
            </div>
        </div>
    );
}
