"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Check,
    X,
    Sparkles,
    MessageCircle,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// מגדירים איך נראית פעולה
interface ActionItemType {
    _id: string;
    agentName: string;
    title: string;
    description: string;
    type: string;
}

interface ActionCenterProps {
    initialActions: ActionItemType[]; // מקבלים את הפעולות מהשרת
}

export default function ActionCenter({ initialActions }: ActionCenterProps) {
    const [actions, setActions] = useState(initialActions);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();

    // פונקציה לטיפול באישור/דחייה
    const handleAction = async (id: string, decision: "approve" | "reject") => {
        setProcessingId(id);

        try {
            const res = await fetch("/api/actions/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ actionId: id, decision }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success(
                    decision === "approve"
                        ? "הפעולה בוצעה בהצלחה!"
                        : "ההצעה הוסרה."
                );
                // הסרת הפריט מהרשימה הוויזואלית
                setActions((prev) => prev.filter((item) => item._id !== id));
                router.refresh(); // רענון נתונים כללי אם צריך
            } else {
                toast.error("שגיאה בביצוע הפעולה");
            }
        } catch (error) {
            toast.error("תקלה בתקשורת");
        } finally {
            setProcessingId(null);
        }
    };

    if (actions.length === 0) {
        // מצב ריק - הכל תקין
        return (
            <Card className="bg-white/50 border-dashed border-2 h-full flex items-center justify-center min-h-[200px]">
                <div className="text-center text-gray-400">
                    <Check className="mx-auto mb-2 opacity-50" size={32} />
                    <p>אין פעולות ממתינות לאישור.</p>
                    <p className="text-xs">
                        העוזרים עובדים על מציאת הזדמנויות...
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
                <Sparkles size={18} className="text-purple-600" />
                הצעות לביצוע (ממתין לאישור)
            </h3>

            <div className="grid gap-3">
                {actions.map((action) => (
                    <Card
                        key={action._id}
                        className="border-l-4 border-l-purple-500 shadow-sm overflow-hidden"
                    >
                        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* צד ימין: הטקסט */}
                            <div className="flex gap-3">
                                <div
                                    className={`mt-1 p-2 rounded-full shrink-0 ${
                                        action.agentName === "analyst"
                                            ? "bg-green-100 text-green-600"
                                            : action.agentName === "marketing"
                                            ? "bg-pink-100 text-pink-600"
                                            : "bg-blue-100 text-blue-600"
                                    }`}
                                >
                                    {action.type === "send_sms" ? (
                                        <MessageCircle size={16} />
                                    ) : (
                                        <AlertTriangle size={16} />
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">
                                        {action.title}
                                    </h4>
                                    <p className="text-sm text-gray-500 leading-snug max-w-md">
                                        {action.description}
                                    </p>
                                    <span className="text-xs text-purple-600 font-medium mt-1 inline-block">
                                        הצעה מ
                                        {action.agentName === "analyst"
                                            ? "רועי"
                                            : action.agentName === "marketing"
                                            ? "מיכל"
                                            : "דניאלה"}
                                    </span>
                                </div>
                            </div>

                            {/* צד שמאל: כפתורים */}
                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:flex-none text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                                    onClick={() =>
                                        handleAction(action._id, "reject")
                                    }
                                    disabled={!!processingId}
                                >
                                    <X size={16} className="mr-1" /> דחה
                                </Button>

                                <Button
                                    size="sm"
                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                    onClick={() =>
                                        handleAction(action._id, "approve")
                                    }
                                    disabled={!!processingId}
                                >
                                    {processingId === action._id ? (
                                        <Loader2
                                            className="animate-spin"
                                            size={16}
                                        />
                                    ) : (
                                        <Check size={16} className="mr-1" />
                                    )}
                                    אשר ביצוע
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
