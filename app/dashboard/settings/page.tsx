"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
    Brain,
    Bot,
    Database,
    UploadCloud,
    Plus,
    Trash2,
    FileText
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Tab 1: Profile
    const [formData, setFormData] = useState({
        businessName: "",
        ownerName: "",
        phone: "",
        address: "",
        description: "",
        tone: "Professional",
        subdomain: ""
    });

    const [domainSaving, setDomainSaving] = useState(false);

    // Tab 3: Knowledge Base
    const [kb, setKb] = useState<any>({ services: [], faqs: [], files: [] });
    const [isKbLoading, setIsKbLoading] = useState(false);
    const [isKbSaving, setIsKbSaving] = useState(false);

    // Fetch Profile & AI Settings
    useEffect(() => {
        const fetchSettings = async () => {
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
                        tone: result.data.tone || "Professional",
                        subdomain: result.data.subdomain || ""
                    });
                }
            } catch (error) {
                toast.error("שגיאה בטעינת הגדרות");
            }
        };

        const fetchKnowledgeBase = async () => {
            setIsKbLoading(true);
            try {
                const res = await fetch("/api/business/knowledge");
                const result = await res.json();
                if (result.success && result.data) {
                    setKb({
                        services: result.data.services || [],
                        faqs: result.data.faqs || [],
                        files: result.data.files || []
                    });
                }
            } catch (error) {
                toast.error("שגיאה בטעינת מאגר הידע");
            } finally {
                setIsKbLoading(false);
            }
        };

        fetchSettings();
        fetchKnowledgeBase();
    }, []);

    // Save Profile & Tone
    const handleSaveDomain = async () => {
        if (!formData.subdomain) return;
        setDomainSaving(true);
        try {
            const res = await fetch('/api/business/domain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subdomain: formData.subdomain })
            });
            const result = await res.json();
            if (res.ok) {
                toast.success('הכתובת נשמרה בהצלחה!');
            } else {
                toast.error(result.error || 'שגיאה בשמירת הכתובת');
            }
        } catch (error) {
            toast.error('שגיאה בשמירת הכתובת');
        } finally {
            setDomainSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/business/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success("ההגדרות נשמרו בהצלחה");
            } else {
                toast.error("שגיאה בשמירת הגדרות");
            }
        } catch (error) {
            toast.error("שגיאה בשמירת הגדרות");
        } finally {
            setIsSaving(false);
        }
    };

    // Save Knowledge Base
    const handleSaveKB = async () => {
        setIsKbSaving(true);
        try {
            const res = await fetch("/api/business/knowledge", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(kb),
            });
            if (res.ok) {
                toast.success("מאגר הידע נשמר בהצלחה");
            } else {
                toast.error("שגיאה בשמירת מאגר הידע");
            }
        } catch (error) {
            toast.error("שגיאה בשמירת מאגר הידע");
        } finally {
            setIsKbSaving(false);
        }
    };

    // KB Helpers
    const addService = () => setKb({ ...kb, services: [...kb.services, { name: "", price: 0 }] });
    const removeService = (idx: number) => {
        const newS = [...kb.services];
        newS.splice(idx, 1);
        setKb({ ...kb, services: newS });
    };
    const updateService = (idx: number, field: string, value: any) => {
        const newS = [...kb.services];
        newS[idx] = { ...newS[idx], [field]: value };
        setKb({ ...kb, services: newS });
    };

    const addFaq = () => setKb({ ...kb, faqs: [...kb.faqs, { question: "", answer: "" }] });
    const removeFaq = (idx: number) => {
        const newF = [...kb.faqs];
        newF.splice(idx, 1);
        setKb({ ...kb, faqs: newF });
    };
    const updateFaq = (idx: number, field: string, value: any) => {
        const newF = [...kb.faqs];
        newF[idx] = { ...newF[idx], [field]: value };
        setKb({ ...kb, faqs: newF });
    };

    // Fake PDF Upload Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            toast.success(`הקובץ ${file.name} נשלח לעיבוד במאגר הידע (Mock)`);
            setKb({
                ...kb,
                files: [...kb.files, { name: file.name, url: "#", uploadedAt: new Date() }]
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">הגדרות מערכת</h1>
                <p className="text-muted-foreground text-lg">נהל את הפרופיל שלך, התנהגות ה-AI ומאגר הידע של העסק.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8 h-14 bg-muted/50 rounded-2xl p-1">
                    <TabsTrigger value="profile" className="rounded-xl text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Building2 className="w-4 h-4 ml-2" /> פרופיל העסק
                    </TabsTrigger>
                    <TabsTrigger value="ai-behavior" className="rounded-xl text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Brain className="w-4 h-4 ml-2" /> התנהגות AI (דניאלה)
                    </TabsTrigger>
                    <TabsTrigger value="knowledge-base" className="rounded-xl text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Database className="w-4 h-4 ml-2" /> מאגר ידע ומחירים
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: PROFILE */}
                <TabsContent value="profile">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="border-b border-border/50 bg-muted/10 pb-6">
                            <CardTitle className="text-2xl">פרטי העסק</CardTitle>
                            <CardDescription className="text-base">הפרטים שיוצגו ללקוחות שלך וישמשו את דניאלה.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>שם העסק</Label>
                                    <Input
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        placeholder="לדוגמה: מרפאת שיניים חיוך"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>שם הבעלים</Label>
                                    <Input
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>טלפון (לשליחת לידים)</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        dir="ltr"
                                        className="text-right"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>כתובת (יוצג ללקוחות)</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>אודות העסק (תקציר כללי)</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border mt-6">
                                <Label className="text-lg font-bold">כתובת אתר (Subdomain)</Label>
                                <p className="text-sm text-muted-foreground">הגדר את כתובת ה-AI של העסק שלך.</p>
                                <div className="flex items-center gap-2" dir="ltr">
                                    <span className="text-muted-foreground bg-muted px-3 py-2 rounded-l-lg border-y border-l">https://</span>
                                    <Input
                                        value={formData.subdomain}
                                        onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                                        placeholder="my-business"
                                        className="rounded-none border-x-0 focus-visible:ring-0 px-2 flex-1"
                                    />
                                    <span className="text-muted-foreground bg-muted px-3 py-2 rounded-r-lg border-y border-r">.foz.co.il</span>
                                </div>
                                <Button onClick={handleSaveDomain} disabled={domainSaving} variant="secondary" className="w-full sm:w-auto mt-2">
                                    {domainSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    בדוק זמינות ושמור
                                </Button>
                            </div>
                            <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto h-12 px-8 text-lg rounded-xl">
                                {isSaving ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Save className="w-5 h-5 ml-2" />}
                                שמור פרטים
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: AI BEHAVIOR */}
                <TabsContent value="ai-behavior">
                    <Card className="border-border/50 shadow-sm border-t-4 border-t-purple-500">
                        <CardHeader className="border-b border-border/50 bg-muted/10 pb-6">
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Bot className="w-6 h-6 text-purple-500" />
                                התנהגות וטון דיבור (דניאלה)
                            </CardTitle>
                            <CardDescription className="text-base">הגדר כיצד הסוכנת שלך מתקשרת מול הלקוחות.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-6">
                            <div className="space-y-4">
                                <Label className="text-lg">טון דיבור</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: "Professional", label: "מקצועי ורשמי", desc: "מנומס, ענייני ומכבד. מתאים למרפאות ועורכי דין." },
                                        { id: "Friendly", label: "חם וידידותי", desc: "שימוש באימוג'ים, קליל ומזמין. מתאים לקוסמטיקה וכושר." },
                                        { id: "Sales-driven", label: "מכוון מכירות", desc: "דוחף לפעולה, יוזם הצעות וסגירת תורים." }
                                    ].map(tone => (
                                        <div 
                                            key={tone.id} 
                                            onClick={() => setFormData({ ...formData, tone: tone.id })}
                                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.tone === tone.id ? "border-purple-500 bg-purple-500/10" : "border-border hover:border-purple-500/50"}`}
                                        >
                                            <div className="font-bold mb-1">{tone.label}</div>
                                            <div className="text-sm text-muted-foreground">{tone.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto h-12 px-8 text-lg rounded-xl bg-purple-600 hover:bg-purple-700">
                                {isSaving ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Save className="w-5 h-5 ml-2" />}
                                שמור התנהגות
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 3: KNOWLEDGE BASE */}
                <TabsContent value="knowledge-base">
                    {isKbLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : (
                        <div className="space-y-6">
                            {/* PDF Uploads */}
                            <Card className="border-border/50 shadow-sm border-t-4 border-t-blue-500">
                                <CardHeader className="border-b border-border/50 bg-muted/10 pb-4">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-500" /> העלאת מסמכים ומחירונים (PDF)
                                    </CardTitle>
                                    <CardDescription>העלה מסמכים ודניאלה תלמד אותם אוטומטית.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center hover:bg-muted/50 transition-colors relative">
                                        <input 
                                            type="file" 
                                            accept=".pdf,.txt,.docx" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={handleFileUpload}
                                        />
                                        <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-lg font-bold text-foreground">גרור קבצים לכאן או לחץ לבחירה</p>
                                        <p className="text-sm text-muted-foreground mt-1">תומך בקבצי PDF, DOCX ו-TXT בלבד.</p>
                                    </div>
                                    
                                    {kb.files.length > 0 && (
                                        <div className="mt-6 space-y-2">
                                            <h4 className="font-semibold text-sm">קבצים קיימים:</h4>
                                            {kb.files.map((file: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border">
                                                    <span className="text-sm font-medium">{file.name}</span>
                                                    <span className="text-xs text-muted-foreground">עובד בהצלחה ✓</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Pricing & Services */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10 pb-4 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">מחירון ושירותים</CardTitle>
                                        <CardDescription>דניאלה תציע שירותים אלו ללקוחות ותאפשר קביעת תור.</CardDescription>
                                    </div>
                                    <Button onClick={addService} size="sm" variant="outline" className="flex gap-2">
                                        <Plus className="w-4 h-4" /> הוסף שירות
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {kb.services.length === 0 && <p className="text-muted-foreground text-sm">אין שירותים מוגדרים.</p>}
                                    {kb.services.map((svc: any, i: number) => (
                                        <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/20 border border-border rounded-xl relative group">
                                            <div className="flex-1 space-y-1">
                                                <Label>שם השירות</Label>
                                                <Input value={svc.name} onChange={e => updateService(i, 'name', e.target.value)} placeholder="לדוג: ייעוץ ראשוני" />
                                            </div>
                                            <div className="w-full sm:w-32 space-y-1">
                                                <Label>מחיר (₪)</Label>
                                                <Input type="number" value={svc.price || ''} onChange={e => updateService(i, 'price', Number(e.target.value))} />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeService(i)} className="sm:self-end mt-4 sm:mt-0 text-red-500 hover:text-red-700 hover:bg-red-500/10">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* FAQs */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="border-b border-border/50 bg-muted/10 pb-4 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">שאלות ותשובות (FAQ)</CardTitle>
                                        <CardDescription>תשובות מוכנות מראש לשאלות נפוצות.</CardDescription>
                                    </div>
                                    <Button onClick={addFaq} size="sm" variant="outline" className="flex gap-2">
                                        <Plus className="w-4 h-4" /> הוסף שאלה
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {kb.faqs.length === 0 && <p className="text-muted-foreground text-sm">אין שאלות מוגדרות.</p>}
                                    {kb.faqs.map((faq: any, i: number) => (
                                        <div key={i} className="p-4 bg-muted/20 border border-border rounded-xl space-y-3 relative group">
                                            <Button variant="ghost" size="icon" onClick={() => removeFaq(i)} className="absolute top-2 left-2 text-red-500 hover:bg-red-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <div className="space-y-1">
                                                <Label>שאלה</Label>
                                                <Input value={faq.question} onChange={e => updateFaq(i, 'question', e.target.value)} placeholder="לדוג: האם אתם פתוחים בשבת?" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label>תשובה</Label>
                                                <Textarea value={faq.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} rows={2} />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Button onClick={handleSaveKB} disabled={isKbSaving} className="w-full sm:w-auto h-12 px-8 text-lg rounded-xl bg-blue-600 hover:bg-blue-700">
                                {isKbSaving ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Save className="w-5 h-5 ml-2" />}
                                שמור מאגר ידע
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
