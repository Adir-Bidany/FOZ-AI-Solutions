"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Trash2, Lock, ChevronDown, Download, Loader2, Facebook, Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InsightCardProps {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    type: string;
    date: string;
    agentName: "Golda";
    status?: string;
    onDeleted?: (id: string) => void;
}

export default function InsightCard({ id, title, content, imageUrl, type, date, agentName, status = "approved", onDeleted }: InsightCardProps) {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPublishingFb, setIsPublishingFb] = useState(false);
    const [isPublishingIg, setIsPublishingIg] = useState(false);
    const router = useRouter();

    const handlePublishToSocial = async (platform: "facebook" | "instagram") => {
        if (platform === "facebook") setIsPublishingFb(true);
        if (platform === "instagram") setIsPublishingIg(true);

        try {
            const res = await fetch("/api/marketing/publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ insightId: id, platform }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error === "NOT_CONNECTED") {
                    toast.error("חשבון Meta אינו מחובר. לחץ על 'התחבר לחשבון Meta' בראש העמוד.");
                } else {
                    toast.error(data.error || data.message || `תקלה בפרסום ל-${platform}`);
                }
                return;
            }

            if (data.success) {
                const platformName = platform === "facebook" ? "פייסבוק" : "אינסטגרם";
                toast.success(`הפוסט פורסם בהצלחה בעמוד ה-${platformName}!`);
            }
        } catch (error) {
            console.error(`Publish error (${platform}):`, error);
            toast.error("תקלה בחיבור לשרת הפרסום.");
        } finally {
            if (platform === "facebook") setIsPublishingFb(false);
            if (platform === "instagram") setIsPublishingIg(false);
        }
    };

    const handleDownloadImage = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!imageUrl || isDownloading) return;

        setIsDownloading(true);
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `golda-post-${id.substring(0, 6)}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            
            toast.success("התמונה הורדה בהצלחה!");
        } catch (error) {
            console.error("Failed to download image:", error);
            // Fallback: open in new tab if blob fetch CORS blocks direct download
            window.open(imageUrl, "_blank");
        } finally {
            setIsDownloading(false);
        }
    };
    
    // Aesthetic Split: Violet/Indigo for Marketing assets, Emerald/Teal for Financial assets
    const marketingTypes = ["social_post", "marketing_tip", "campaign_idea"];
    const isMarketing = marketingTypes.includes(type);

    const cardBg = "bg-card/90 border-border text-card-foreground shadow-sm backdrop-blur-xl hover:shadow-md";
    const badgeBg = "bg-muted border border-border";
    const badgeText = "text-muted-foreground font-semibold";
    const btnText = "text-foreground font-semibold";
    const btnBorder = "border-border";
    const btnHover = "hover:bg-accent";

    const isPending = status === "pending";

    const toggleOpen = () => {
        if (!isPending) {
            setIsOpen(!isOpen);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success("התוכן הועתק בהצלחה!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        if (!confirm("האם אתה בטוח שברצונך למחוק פוסט זה לצמיתות?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/insights/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("הפוסט נמחק בהצלחה.");
            onDeleted?.(id);
        } catch (error) {
            console.error(error);
            toast.error("שגיאה במחיקת הפוסט");
            setIsDeleting(false);
        }
    };

    const formatType = (type: string) => {
        const typeMap: Record<string, string> = {
            "social_post": "פוסט לרשתות",
            "marketing_tip": "טיפ שיווקי",
            "campaign_idea": "רעיון לקמפיין",
            "financial_report": "דוח פיננסי",
            "budget_analysis": "ניתוח תקציב",
            "pricing_insight": "תובנת תמחור"
        };
        return typeMap[type] || type.replace("_", " ");
    };

    return (
        <Card className={`border shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group relative ${cardBg} ${isPending ? 'min-h-[160px]' : 'h-fit'}`}>
            
            {isPending && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center backdrop-blur-[4px] bg-white/40 rounded-2xl">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md mb-3 border border-gray-100">
                        <Lock className="text-gray-400 w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                        ממתין לאישור של גולדה
                    </span>
                </div>
            )}

            <CardHeader 
                className={`pb-4 ${!isPending ? 'cursor-pointer select-none transition-colors hover:bg-white/50' : ''}`}
                onClick={toggleOpen}
            >
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-bold text-gray-800 leading-tight">
                        {title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${badgeBg} ${badgeText} font-semibold shrink-0`}>
                            {formatType(type)}
                        </span>
                        {!isPending && (
                            <div className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                <ChevronDown size={20} />
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(date).toLocaleDateString("he-IL")}</p>
            </CardHeader>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <CardContent className="p-6 pt-2 flex-grow relative space-y-4">
                    {imageUrl && (
                        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-border/60 shadow-sm bg-black/5 group">
                            <img
                                src={imageUrl}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                                AI Image
                            </div>

                            <button
                                onClick={handleDownloadImage}
                                disabled={isDownloading}
                                className="absolute bottom-3 left-3 bg-black/70 hover:bg-black/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                                title="הורד תמונה למחשב"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        <span>מוריד...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={12} />
                                        <span>הורד תמונה</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                    <div className="text-foreground whitespace-pre-wrap text-[15px] leading-relaxed" dir="auto">
                        {content}
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 border-t border-border flex flex-col gap-2.5">
                    <div className="flex gap-2 w-full">
                        <Button
                            onClick={() => handlePublishToSocial("facebook")}
                            disabled={isPublishingFb}
                            size="sm"
                            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                        >
                            {isPublishingFb ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Facebook size={14} />
                            )}
                            פרסם בפייסבוק
                        </Button>

                        <Button
                            onClick={() => handlePublishToSocial("instagram")}
                            disabled={isPublishingIg}
                            size="sm"
                            className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xs gap-1.5 shadow-sm"
                        >
                            {isPublishingIg ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Instagram size={14} />
                            )}
                            פרסם באינסטגרם
                        </Button>
                    </div>

                    <div className="flex gap-2 w-full">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCopy}
                            className={`flex-1 rounded-xl shadow-sm bg-background border-border text-foreground hover:bg-accent text-xs font-semibold`}
                        >
                            {copied ? <CheckCircle size={14} className="ml-1.5" /> : <Copy size={14} className="ml-1.5" />}
                            {copied ? "הועתק!" : "העתק תוכן"}
                        </Button>
                        
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`rounded-xl text-muted-foreground transition-colors px-3 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40`}
                            title="מחק פוסט לצמיתות"
                        >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </Button>
                    </div>
                </CardFooter>
            </div>
        </Card>
    );
}
