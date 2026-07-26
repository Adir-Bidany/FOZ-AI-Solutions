"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Archive, Lock, ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InsightCardProps {
    id: string;
    title: string;
    content: string;
    type: string;
    date: string;
    agentName: "Golda";
    status?: string;
}

export default function InsightCard({ id, title, content, type, date, agentName, status = "approved" }: InsightCardProps) {
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const router = useRouter();
    
    // Aesthetic Split: Violet/Indigo for Marketing assets, Emerald/Teal for Financial assets
    const marketingTypes = ["social_post", "marketing_tip", "campaign_idea"];
    const isMarketing = marketingTypes.includes(type);

    const cardBg = isMarketing ? "bg-indigo-50/40 border-indigo-100" : "bg-emerald-50/40 border-emerald-100";
    const badgeBg = isMarketing ? "bg-indigo-100" : "bg-emerald-100";
    const badgeText = isMarketing ? "text-indigo-700" : "text-emerald-700";
    const btnText = isMarketing ? "text-indigo-600" : "text-emerald-600";
    const btnBorder = isMarketing ? "border-indigo-200" : "border-emerald-200";
    const btnHover = isMarketing ? "hover:bg-indigo-50" : "hover:bg-emerald-50";

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

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            const res = await fetch(`/api/insights/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "archived" })
            });
            if (!res.ok) throw new Error("Failed to archive");
            toast.success("הוסתר בהצלחה");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("שגיאה בהסתרת התוכן");
            setIsArchiving(false);
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
                <CardContent className="p-6 pt-2 flex-grow relative">
                    <div className={`text-gray-700 whitespace-pre-wrap text-[15px] leading-relaxed`} dir="auto">
                        {content}
                    </div>
                </CardContent>
                <CardFooter className="bg-white/40 p-4 border-t border-gray-100/50 flex gap-3">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCopy}
                        className={`flex-1 rounded-xl shadow-sm bg-white ${btnBorder} ${btnText} ${btnHover} transition-colors`}
                    >
                        {copied ? <CheckCircle size={16} className="ml-2" /> : <Copy size={16} className="ml-2" />}
                        {copied ? "הועתק!" : "העתק תוכן"}
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleArchive}
                        disabled={isArchiving}
                        className={`rounded-xl text-gray-400 transition-colors px-3 hover:text-red-600 hover:bg-red-50`}
                        title="הסתר/ארכיון"
                    >
                        <Archive size={18} />
                    </Button>
                </CardFooter>
            </div>
        </Card>
    );
}
