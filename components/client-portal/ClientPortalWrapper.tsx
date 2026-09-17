"use client";

import ClientGreeting from "./ClientGreeting";
import UpcomingAppointmentCard from "./UpcomingAppointmentCard";
import PastTreatmentsList from "./PastTreatmentsList";
import PublicAvailabilityCalendar from "./PublicAvailabilityCalendar";
import DanielaFAB from "./DanielaFAB";

interface ClientPortalWrapperProps {
    customerName: string;
    businessConfig: any;
}

export default function ClientPortalWrapper({ customerName, businessConfig }: ClientPortalWrapperProps) {
    return (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6 pb-28" dir="rtl">
            {/* Greeting */}
            <ClientGreeting customerName={customerName} />

            <hr className="border-border opacity-50" />

            {/* Upcoming appointment */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-0.5">התור הקרוב</h2>
                <UpcomingAppointmentCard />
            </section>

            {/* Past treatments */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-0.5">טיפולים קודמים</h2>
                <PastTreatmentsList />
            </section>
            
            {/* Public Availability Calendar */}
            <section className="flex flex-col gap-2">
                <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-0.5">קביעת תור חדש</h2>
                <PublicAvailabilityCalendar businessId={businessConfig._id.toString()} />
            </section>

            {/* Daniela FAB — fixed to viewport, no layout impact */}
            <DanielaFAB businessConfig={businessConfig} />
        </div>
    );
}
