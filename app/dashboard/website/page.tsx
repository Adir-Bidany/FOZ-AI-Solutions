"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Save,
    Loader2,
    Globe,
    UploadCloud,
    Layout,
    Check,
    Image as ImageIcon,
} from "lucide-react";
import { BACKGROUND_PRESETS } from "@/lib/background-presets";
import { useSession } from "next-auth/react";

import { toast } from "sonner";

export default function WebsiteEditorPage() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        hero_title: "",
        hero_subtitle: "",
        hero_image_url: "",
        features: "",
        primary_color: "",
        background_style: "soft-rose",
        custom_background_image: "",
    });

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/business/website");
                const result = await res.json();

                if (result.success && result.data) {
                    setFormData({
                        hero_title: result.data.hero_title || "",
                        hero_subtitle: result.data.hero_subtitle || "",
                        hero_image_url: result.data.hero_image_url || "",
                        features: Array.isArray(result.data.features)
                            ? result.data.features.join("\n")
                            : result.data.features || "",
                        primary_color: result.data.primary_color || "",
                        background_style:
                            result.data.background_style || "soft-rose",
                        custom_background_image:
                            result.data.custom_background_image || "",
                    });
                }
            } catch (error) {
                console.error("Failed to load data", error);
                toast.error("שגיאה בטעינת הנתונים");
            }
        };

        if (session?.user?.email) {
            fetchData();
        }
    }, [session]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            // 4MB limit
            toast.error("התמונה גדולה מדי. אנא בחרי תמונה עד 4MB.");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;

            // Optimistic update
            setFormData((prev) => ({ ...prev, hero_image_url: base64 }));

            try {
                const res = await fetch("/api/business/upload-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image: base64,
                        targetField: "hero_image",
                    }),
                });

                const result = await res.json();
                if (result.success) {
                    toast.success("התמונה הועלתה בהצלחה!");
                } else {
                    toast.error("שגיאה בהעלאת התמונה");
                    // Revert optimistic update if needed, but for now we keep it as user might try again
                }
            } catch (error) {
                console.error(error);
                toast.error("שגיאה בהעלאת התמונה");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleBackgroundUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            // 4MB limit
            toast.error("התמונה גדולה מדי. אנא בחרי תמונה עד 4MB.");
            return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;

            // Optimistic update
            setFormData((prev) => ({
                ...prev,
                custom_background_image: base64,
                background_style: "custom",
            }));

            try {
                const res = await fetch("/api/business/upload-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image: base64,
                        targetField: "custom_background_image",
                    }),
                });

                const result = await res.json();
                if (result.success) {
                    toast.success("רקע הועלה בהצלחה!");
                } else {
                    toast.error("שגיאה בהעלאת הרקע");
                }
            } catch (error) {
                console.error(error);
                toast.error("שגיאה בהעלאת הרקע");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setIsLoading(true);

        try {
            // Convert features string back to array
            const dataToSave = {
                ...formData,
                features: formData.features
                    .split("\n")
                    .map((f) => f.trim())
                    .filter((f) => f !== ""),
                background_style: formData.background_style,
                custom_background_image: formData.custom_background_image,
            };

            const res = await fetch("/api/business/website", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSave),
            });

            const result = await res.json();

            if (result.success) {
                toast.success("השינויים נשמרו בהצלחה!");
            } else {
                toast.error("שגיאה בשמירת השינויים");
            }
        } catch (error) {
            console.error(error);
            toast.error("שגיאה לא צפויה");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        עריכת עמוד נחיתה
                    </h1>
                    <p className="text-gray-500 mt-2">
                        כאן תוכלי לערוך את התוכן שמופיע באתר האישי שלך.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    שמור שינויים
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-purple-600" />
                            תוכן ראשי (Hero Section)
                        </CardTitle>
                        <CardDescription>
                            החלק הראשון שהלקוחות רואות כשהן נכנסות לאתר.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="hero_title">כותרת ראשית</Label>
                            <Input
                                id="hero_title"
                                name="hero_title"
                                value={formData.hero_title}
                                onChange={handleChange}
                                placeholder="למשל: טיפולי פנים ברמה אחרת"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero_subtitle">כותרת משנה</Label>
                            <Textarea
                                id="hero_subtitle"
                                name="hero_subtitle"
                                value={formData.hero_subtitle}
                                onChange={handleChange}
                                placeholder="למשל: העסק המובילה ברעננה לטיפולי אנטי-אייג'ינג..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="hero_image_url">תמונה ראשית</Label>

                            <div
                                className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative overflow-hidden group min-h-[200px]"
                                onClick={() =>
                                    document
                                        .getElementById("hero_image_input")
                                        ?.click()
                                }
                            >
                                {formData.hero_image_url ? (
                                    <div className="relative w-full h-48">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={formData.hero_image_url}
                                            alt="Hero Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-sm font-medium rounded-lg transition-all">
                                            לחצי להחלפה
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                                            <UploadCloud size={24} />
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium text-center">
                                            לחצי להעלאת תמונה
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            עד 4MB, פורמט JPG/PNG
                                        </p>
                                    </>
                                )}

                                <input
                                    id="hero_image_input"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </div>

                            {isUploading && (
                                <p className="text-xs text-purple-600 text-center animate-pulse flex items-center justify-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />{" "}
                                    מעלה תמונה...
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>יתרונות ושירותים</CardTitle>
                        <CardDescription>
                            רשימת היתרונות שמופיעה מתחת לכותרת. כל שורה תופיע
                            כיתרון נפרד עם וי.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="features">
                                רשימת יתרונות (כל יתרון בשורה חדשה)
                            </Label>
                            <Textarea
                                id="features"
                                name="features"
                                value={formData.features}
                                onChange={handleChange}
                                placeholder={
                                    "חומרים טבעיים בלבד\nחניה חינם בשפע\nזמינות גבוהה"
                                }
                                rows={6}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layout className="w-5 h-5 text-purple-600" />
                        עיצוב רקע
                    </CardTitle>
                    <CardDescription>
                        בחרי את סגנון הרקע של עמוד הנחיתה שלך.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {BACKGROUND_PRESETS.map((preset) => (
                            <div
                                key={preset.id}
                                onClick={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        background_style: preset.id,
                                    }))
                                }
                                className={`
                                    cursor-pointer rounded-xl border-2 p-1 transition-all relative group
                                    ${
                                        formData.background_style === preset.id
                                            ? "border-purple-600 ring-2 ring-purple-100"
                                            : "border-transparent hover:border-gray-200"
                                    }
                                `}
                            >
                                <div
                                    className="w-full aspect-square rounded-lg shadow-sm mb-2"
                                    style={{ background: preset.previewColor }}
                                />
                                <div className="text-center text-sm font-medium text-gray-700">
                                    {preset.label}
                                </div>
                                {formData.background_style === preset.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-sm">
                                        <Check size={14} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <Label className="mb-4 block">או העלי רקע משלך</Label>
                        <div
                            className={`
                                border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group min-h-[120px]
                                ${formData.background_style === "custom" ? "border-purple-600 bg-purple-50/50" : "border-gray-200 hover:bg-gray-50"}
                            `}
                            onClick={() =>
                                document
                                    .getElementById("bg_image_input")
                                    ?.click()
                            }
                        >
                            {formData.custom_background_image ? (
                                <div className="relative w-full h-32">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={formData.custom_background_image}
                                        alt="Custom Background"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-sm font-medium rounded-lg transition-all">
                                        לחצי להחלפה
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                        <ImageIcon size={20} />
                                    </div>
                                    <span className="text-sm font-medium">
                                        העלאת תמונה אישית
                                    </span>
                                </div>
                            )}

                            {formData.background_style === "custom" &&
                                formData.custom_background_image && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-sm z-10">
                                        <Check size={14} />
                                    </div>
                                )}

                            <input
                                id="bg_image_input"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleBackgroundUpload}
                                disabled={isUploading}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
