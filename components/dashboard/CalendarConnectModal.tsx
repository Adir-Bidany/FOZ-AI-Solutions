"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SimplyBookConnect from "@/components/dashboard/SimplyBookConnect";
import { useState } from "react";

export default function CalendarConnectModal({ hasError = false }: { hasError?: boolean }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={`${hasError ? 'bg-red-600 hover:bg-red-700 shadow-[0_8px_30px_rgb(220,38,38,0.3)] hover:shadow-[0_8px_30px_rgb(220,38,38,0.5)]' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.5)]'} transition-all text-lg px-8 py-6 rounded-full font-bold text-white`}>
                    {hasError ? "החיבור נכשל - נסה להתחבר שנית" : "התחבר ליומן אישי"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-transparent border-none p-0 shadow-none">
                <DialogTitle className="sr-only">התחבר ליומן</DialogTitle>
                <SimplyBookConnect />
            </DialogContent>
        </Dialog>
    );
}
