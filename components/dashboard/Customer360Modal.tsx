"use client";

import React, { useState, useEffect } from "react";
import { X, Users, MessageSquare, Calendar, Tag, Sparkles, TrendingUp, AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

interface Customer360ModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: string;
    onDelete?: (id: string) => void;
}

export default function Customer360Modal({ isOpen, onClose, customerId, onDelete }: Customer360ModalProps) {
    const [profile, setProfile] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [chats, setChats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Tag management
    const [newTag, setNewTag] = useState("");
    const [isUpdatingTags, setIsUpdatingTags] = useState(false);

    // AI Summary
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const [activeTab, setActiveTab] = useState<"overview" | "history" | "chats">("overview");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isOpen && customerId) {
            fetchCustomerData();
        } else {
            // Reset state when closed
            setProfile(null);
            setAppointments([]);
            setChats([]);
            setAiSummary(null);
            setActiveTab("overview");
            setIsDeleting(false);
        }
    }, [isOpen, customerId]);

    const fetchCustomerData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/business/customers/${customerId}`);
            const data = await res.json();
            if (data.success) {
                setProfile(data.customer);
                setAppointments(data.appointments || []);
                setChats(data.chats || []);
            } else {
                toast.error("Failed to load customer profile");
            }
        } catch (error) {
            console.error(error);
            toast.error("Network error fetching profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = async () => {
        if (!newTag.trim() || !profile) return;
        
        const updatedTags = [...(profile.marketing_tags || []), newTag.trim()];
        await updateTagsInDb(updatedTags);
        setNewTag("");
    };

    const handleRemoveTag = async (tagToRemove: string) => {
        if (!profile) return;
        const updatedTags = (profile.marketing_tags || []).filter((t: string) => t !== tagToRemove);
        await updateTagsInDb(updatedTags);
    };

    const updateTagsInDb = async (tags: string[]) => {
        setIsUpdatingTags(true);
        try {
            const res = await fetch(`/api/business/customers/${customerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ marketing_tags: tags })
            });
            const data = await res.json();
            if (data.success) {
                setProfile({ ...profile, marketing_tags: tags });
                toast.success("Tags updated successfully");
            }
        } catch (error) {
            toast.error("Failed to update tags");
        } finally {
            setIsUpdatingTags(false);
        }
    };

    const handleGenerateSummary = async () => {
        setIsGeneratingSummary(true);
        // Placeholder for Gemini integration in the next phase
        setTimeout(() => {
            setAiSummary("לקוח ותיק, הגיע דרך קמפיין פייסבוק. מביע עניין רב בטיפולי בוטוקס אך רגיש למחיר. סנטימנט כללי: חיובי מאוד. מומלץ להציע חבילת היכרות בפגישה הבאה.");
            setIsGeneratingSummary(false);
            toast.success("AI Summary generated!");
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6" dir="rtl">
            <div className="bg-background text-foreground rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col relative border border-border overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">
                                {profile ? `${profile.name} ${profile.lastName || ""}` : "טוען..."}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {profile?.email} {profile?.email && profile?.phone ? "|" : ""} {profile?.phone}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar Navigation */}
                        <div className="w-48 bg-muted/20 border-l border-border p-4 space-y-2">
                            <Button 
                                variant={activeTab === "overview" ? "secondary" : "ghost"} 
                                className="w-full justify-start font-medium"
                                onClick={() => setActiveTab("overview")}
                            >
                                <TrendingUp className="w-4 h-4 ml-2" /> פרופיל 360
                            </Button>
                            <Button 
                                variant={activeTab === "history" ? "secondary" : "ghost"} 
                                className="w-full justify-start font-medium"
                                onClick={() => setActiveTab("history")}
                            >
                                <Calendar className="w-4 h-4 ml-2" /> היסטוריית תורים
                            </Button>
                            <Button 
                                variant={activeTab === "chats" ? "secondary" : "ghost"} 
                                className="w-full justify-start font-medium"
                                onClick={() => setActiveTab("chats")}
                            >
                                <MessageSquare className="w-4 h-4 ml-2" /> תמלילי שיחות
                            </Button>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto p-6 bg-card/10">
                            
                            {/* OVERVIEW TAB */}
                            {activeTab === "overview" && profile && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                    
                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                                            <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><TrendingUp className="w-6 h-6" /></div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">הכנסות מלקוח זה</p>
                                                <p className="text-2xl font-bold text-foreground">₪{profile.metrics?.totalRevenue || 0}</p>
                                            </div>
                                        </div>
                                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
                                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Calendar className="w-6 h-6" /></div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">תורים שנקבעו</p>
                                                <p className="text-2xl font-bold text-foreground">{profile.metrics?.totalAppointments || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Sentiment Summary */}
                                    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                                                <Sparkles className="w-5 h-5" /> תקציר AI (גולדה)
                                            </h3>
                                            {!aiSummary && (
                                                <Button size="sm" onClick={handleGenerateSummary} disabled={isGeneratingSummary} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    {isGeneratingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : "צור תקציר משיחות"}
                                                </Button>
                                            )}
                                        </div>
                                        <div className="text-muted-foreground text-sm leading-relaxed bg-background/50 p-4 rounded-xl border border-border/50 min-h-[80px]">
                                            {aiSummary ? aiSummary : "לחץ על הכפתור כדי שגולדה תסכם את היסטוריית הלקוח ותפיק תובנות וסנטימנט."}
                                        </div>
                                    </div>

                                    {/* Marketing Tags */}
                                    <div className="bg-card border border-border rounded-2xl p-6">
                                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                                            <Tag className="w-5 h-5 text-pink-500" /> תגיות שיווקיות (Marketing Tags)
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(profile.marketing_tags || []).length === 0 && (
                                                <span className="text-sm text-muted-foreground">אין תגיות ללקוח זה.</span>
                                            )}
                                            {(profile.marketing_tags || []).map((tag: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-1 bg-pink-500/10 text-pink-600 border border-pink-500/20 px-3 py-1 rounded-full text-sm">
                                                    {tag}
                                                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-pink-800 focus:outline-none ml-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2 max-w-sm">
                                            <Input 
                                                placeholder="הוסף תגית (לדוג: מתעניין בבוטוקס, VIP)" 
                                                value={newTag} 
                                                onChange={e => setNewTag(e.target.value)}
                                                onKeyDown={e => e.key === "Enter" && handleAddTag()}
                                                disabled={isUpdatingTags}
                                            />
                                            <Button variant="outline" onClick={handleAddTag} disabled={isUpdatingTags}>
                                                {isUpdatingTags ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Danger Zone */}
                                    <div className="mt-8 pt-8 border-t border-border">
                                        {!isDeleting ? (
                                            <Button variant="destructive" onClick={() => setIsDeleting(true)} className="w-full sm:w-auto">
                                                מחק לקוח לצמיתות
                                            </Button>
                                        ) : (
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span className="font-bold text-sm">האם אתה בטוח? פעולה זו אינה הפיכה.</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => setIsDeleting(false)}>ביטול</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => {
                                                        if (onDelete) onDelete(profile._id);
                                                        onClose();
                                                    }}>אשר מחיקה</Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* HISTORY TAB */}
                            {activeTab === "history" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="text-lg font-bold mb-4">היסטוריית תורים ({appointments.length})</h3>
                                    {appointments.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">לא נמצאו תורים ללקוח זה.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {appointments.map((apt: any) => (
                                                <div key={apt._id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <p className="font-bold">{apt.details?.service_name || apt.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {format(new Date(apt.details?.date), "dd/MM/yyyy HH:mm")} • {apt.details?.duration_minutes} דקות
                                                        </p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${apt.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : apt.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-600'}`}>
                                                        {apt.status}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CHATS TAB */}
                            {activeTab === "chats" && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="text-lg font-bold mb-4">תמלילי שיחות מול דניאלה ({chats.length})</h3>
                                    {chats.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">לא נמצאו שיחות ללקוח זה.</p>
                                    ) : (
                                        <div className="space-y-6">
                                            {chats.map((chat: any) => (
                                                <div key={chat._id} className="bg-card border border-border rounded-xl overflow-hidden">
                                                    <div className="bg-muted/30 px-4 py-2 border-b border-border flex justify-between items-center">
                                                        <span className="text-xs font-bold text-muted-foreground">
                                                            {format(new Date(chat.updatedAt), "dd/MM/yyyy HH:mm")}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                            {chat.messages?.length || 0} הודעות
                                                        </span>
                                                    </div>
                                                    <div className="p-4 max-h-[300px] overflow-y-auto space-y-3">
                                                        {chat.messages?.map((msg: any, i: number) => (
                                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-muted text-foreground rounded-tr-none' : 'bg-primary/10 text-primary border border-primary/20 rounded-tl-none'}`}>
                                                                    {msg.parts?.[0]?.text || ""}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
