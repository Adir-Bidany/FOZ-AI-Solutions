"use client";

import ClientGreeting from "./ClientGreeting";
import UpcomingAppointmentCard from "./UpcomingAppointmentCard";
import PastTreatmentsList from "./PastTreatmentsList";
import PublicAvailabilityCalendar from "./PublicAvailabilityCalendar";
import DanielaFAB from "./DanielaFAB";
import WaitlistAlert from "./WaitlistAlert";
import PushPromptBanner from "./PushPromptBanner";
import BusinessPolicies from "@/components/landing/BusinessPolicies";

interface ClientPortalWrapperProps {
    customerName: string;
    businessConfig: any;
}

export default function ClientPortalWrapper({ customerName, businessConfig }: ClientPortalWrapperProps) {
    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 pb-20" dir="rtl">
            {/* Waitlist Notification Banner */}
            <WaitlistAlert />

            {/* Push Notifications Opt-In Banner */}
            <PushPromptBanner />

            {/* Top Row: 2 Columns on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                
                {/* Right Column (50%): Core Info */}
                <div className="flex flex-col gap-6 order-1">
                    <ClientGreeting customerName={customerName} />
                    <hr className="border-border opacity-50" />
                    
                    <section className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-0.5">התור הקרוב</h2>
                        <UpcomingAppointmentCard />
                    </section>
                    
                    <section className="flex flex-col gap-2">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-0.5">טיפולים קודמים</h2>
                        <PastTreatmentsList />
                    </section>
                </div>

                {/* Left Column (50%): Premium Daniela Frame */}
                <div className="flex flex-col order-2 h-[500px] lg:h-auto min-h-[500px]">
                    {/* DanielaFAB will expand to fill this entire container */}
                    <DanielaFAB businessConfig={businessConfig} />
                </div>
            </div>

            {/* Bottom Row: Full Width Calendar */}
            <div className="mt-4">
                <section className="flex flex-col gap-2">
                    <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-0.5">קביעת תור חדש</h2>
                    <PublicAvailabilityCalendar businessId={businessConfig._id.toString()} />
                </section>
            </div>

            {/* Business Policies */}
            {businessConfig.policies && businessConfig.policies.length > 0 && (
                <BusinessPolicies policies={businessConfig.policies} />
            )}
        </div>
    );
}
