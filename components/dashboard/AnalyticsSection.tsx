"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Download, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale/he";
import useSWR from "swr";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnalyticsSection() {
    const [date, setDate] = useState<Date | undefined>(new Date());

    // Fetch stats for selected date (or today if undefined)
    const dateQuery = date ? `?date=${date.toISOString()}` : "";
    const { data, error } = useSWR(`/api/dashboard/stats${dateQuery}`, fetcher);

    const handleExport = () => {
        // Simple CSV generation logic
        // In a real app, this would likely hit an API endpoint that streams a CSV
        if (!data) return;

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Daily Count,Lifetime Count\n"
            + `${date ? format(date, "yyyy-MM-dd") : "Today"},${data.dailyCount},${data.lifetimeCount}`;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mt-12 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Lifetime Stats */}
                <Card className="border-none shadow-sm bg-card rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            סה״כ שיחות (מאז ומעולם)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {data ? data.lifetimeCount : "..."}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            כל השיחות שהוגדרו כלידים
                        </p>
                    </CardContent>
                </Card>

                {/* Card 2: Date Picker Filter */}
                <Card className="border-none shadow-sm bg-card rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            סינון לפי תאריך
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-10 rounded-xl",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? (
                                        format(date, "PPP", { locale: he })
                                    ) : (
                                        <span>בחר תאריך</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">שיחות ביום זה:</span>
                            <span className="font-bold text-lg text-foreground">
                                {data ? data.dailyCount : "..."}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Export */}
                <Card className="border-none shadow-sm bg-card rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ייצוא נתונים
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-between h-[calc(100%-3rem)]">
                        <p className="text-sm text-muted-foreground mb-4">
                            הורדת דוח מרוכז של נתוני השיחות לקובץ CSV.
                        </p>
                        <Button
                            onClick={handleExport}
                            className="w-full h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                        >
                            <Download size={16} /> הורד דוח
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
