"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings2, CalendarOff, Plus } from "lucide-react";
import WorkingHoursModal, { WorkingHourEntry } from "./WorkingHoursModal";
import BlockTimeModal from "./BlockTimeModal";
import BusinessSettingsModal from "./BusinessSettingsModal";

interface CalendarControlBarProps {
    workingHours?: WorkingHourEntry[];
    onOpenAddModal: () => void;
}

export default function CalendarControlBar({ workingHours, onOpenAddModal }: CalendarControlBarProps) {
    const [showWorkingHours, setShowWorkingHours] = useState(false);
    const [showBlockTime, setShowBlockTime] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between mb-4 px-1">
                {/* Left — descriptive label */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                        onClick={() => setShowSettings(true)}
                        title="הגדרות עסק"
                    >
                        <Settings2 className="w-5 h-5" />
                    </Button>
                    <p className="text-sm text-slate-500 font-medium hidden sm:block">
                        ניהול יומן תורים מקומי
                    </p>
                </div>

                {/* Right — Action Buttons */}
                <div className="flex items-center gap-2 ms-auto">
                    <Button
                        variant="default"
                        size="sm"
                        className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-medium shadow-sm"
                        onClick={onOpenAddModal}
                    >
                        <Plus className="w-4 h-4" />
                        תור חדש
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 gap-1.5 font-medium shadow-sm"
                        onClick={() => setShowWorkingHours(true)}
                    >
                        <Settings2 className="w-4 h-4 text-blue-500" />
                        הגדרת שעות
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-1.5 font-medium shadow-sm"
                        onClick={() => setShowBlockTime(true)}
                    >
                        <CalendarOff className="w-4 h-4" />
                        חסימת יומן
                    </Button>
                </div>
            </div>

            <WorkingHoursModal
                open={showWorkingHours}
                onOpenChange={setShowWorkingHours}
                initialHours={workingHours}
            />
            <BlockTimeModal
                open={showBlockTime}
                onOpenChange={setShowBlockTime}
            />
            <BusinessSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
}
