"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import { useState, useEffect } from "react";

interface MobileSidebarProps {
    client: { businessName: string; slug: string; ownerName: string; logo?: string; } | any;
}

export default function MobileSidebar({ client }: MobileSidebarProps) {
    const [open, setOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="w-10 h-10 lg:hidden" />; 
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80 border-l-0" dir="rtl">
                {/* 
                    Pass a callback or handle link clicks to close the sheet? 
                    The Sidebar component uses Next.js Links. 
                    Ideally, clicking a link should close the sheet.
                    However, Sidebar doesn't accept an onClose prop currently.
                    For now, we'll rely on the default behavior (user clicks outside or close button).
                    To fix this properly, we'd need to update Sidebar to accept an onLinkClick prop.
                */}
                <div onClick={() => setOpen(false)}>
                    <Sidebar client={client} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
