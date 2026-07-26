"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, Trash2, Clock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { deletePendingAsset } from "@/actions/dashboard";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface PendingAssetCardProps {
    id: string;
    title: string;
    content: string;
    type: string;
    date: string;
    onDeleted?: (id: string) => void;
}

export default function PendingAssetCard({
    id,
    title,
    content,
    type,
    date,
    onDeleted,
}: PendingAssetCardProps) {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formattedDate = date ? new Date(date).toLocaleDateString("he-IL") : "";

    const handleApproveAndPublish = () => {
        toast.info("תכונה עתידית: פרסום לרשתות חברתיות");
    };

    const handleDelete = async () => {
        if (!confirm(`האם למחוק את ההצעה "${title}"?`)) return;

        setIsDeleting(true);
        try {
            const res = await deletePendingAsset(id);
            if (res.success) {
                toast.success("ההצעה נמחקה בהצלחה.");
                if (onDeleted) onDeleted(id);
            } else {
                toast.error(res.error || "תקלה במחיקת ההצעה.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("תקלה במחיקת ההצעה.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Card className="bg-fuchsia-50/40 border-fuchsia-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between overflow-hidden">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-fuchsia-100 text-fuchsia-800 flex items-center gap-1">
                            <Clock size={12} /> ממתין לאישור שלך
                        </span>
                        <span className="text-xs text-gray-400">{formattedDate}</span>
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 leading-snug line-clamp-2">
                        {title}
                    </CardTitle>
                </CardHeader>

                <CardContent className="py-2 flex-1">
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {content}
                    </p>
                </CardContent>

                <CardFooter className="pt-4 pb-4 border-t border-fuchsia-100/60 bg-white/60 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                            onClick={() => setIsViewModalOpen(true)}
                            variant="outline"
                            size="sm"
                            className="w-full gap-1.5 rounded-xl border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50 text-xs font-medium"
                        >
                            <Eye size={14} /> הצג פוסט
                        </Button>
                        <Button
                            onClick={handleApproveAndPublish}
                            size="sm"
                            className="w-full gap-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-medium shadow-sm"
                        >
                            <CheckCircle size={14} /> אישור ופרסום
                        </Button>
                    </div>

                    <Button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        variant="ghost"
                        size="sm"
                        className="w-full gap-1.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    >
                        <Trash2 size={14} /> מחק פוסט
                    </Button>
                </CardFooter>
            </Card>

            {/* Modal for הצג פוסט */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-xl dir-rtl text-right rounded-2xl p-6" dir="rtl">
                    <DialogHeader className="text-right pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-fuchsia-100 text-fuchsia-800">
                                תצוגה מקדימה - הצעת תוכן מגולדה
                            </span>
                        </div>
                        <DialogTitle className="text-xl font-bold text-gray-900 mt-1">
                            {title}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {content}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between flex-row-reverse border-t border-gray-100 pt-4">
                        <div className="flex gap-2">
                            <Button
                                onClick={handleApproveAndPublish}
                                className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-xl shadow-sm"
                            >
                                <CheckCircle size={16} /> אישור ופרסום
                            </Button>
                            <Button
                                onClick={() => setIsViewModalOpen(false)}
                                variant="outline"
                                className="rounded-xl border-gray-200"
                            >
                                סגור
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
