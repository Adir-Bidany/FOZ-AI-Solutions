"use client";

import { useState } from "react";
import CalendarControlBar from "./CalendarControlBar";
import WeeklyCalendar from "../WeeklyCalendar";
import AddAppointmentModal from "./AddAppointmentModal";
import EditAppointmentModal from "./EditAppointmentModal";

export default function CalendarContainer({ events, workingHours }: { events: any[], workingHours: any[] | undefined }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
    const [eventToEdit, setEventToEdit] = useState<any>(null);

    const handleOpenAddModal = (date?: string, time?: string) => {
        setSelectedDate(date);
        setSelectedTime(time);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (event: any) => {
        setEventToEdit(event);
        setIsEditModalOpen(true);
    };

    return (
        <>
            <CalendarControlBar
                workingHours={workingHours}
                onOpenAddModal={() => handleOpenAddModal()}
            />
            
            <WeeklyCalendar
                events={events}
                workingHours={workingHours}
                onSlotClick={handleOpenAddModal}
                onEditEvent={handleOpenEditModal}
            />

            <AddAppointmentModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                initialDate={selectedDate}
                initialTime={selectedTime}
            />

            <EditAppointmentModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                event={eventToEdit}
            />
        </>
    );
}
