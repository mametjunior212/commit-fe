import React, { useEffect, useMemo, useState } from "react";
import { CalendarBody } from "@/components/features/calendar/calendar-body";
import { CalendarProvider } from "@/components/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/components/features/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/components/features/calendar/header/calendar-header";
import { getEvents, getUsers } from "@/components/features/calendar/requests";
import { useEvent } from "@/hooks/useEvent";
import { Project } from "@/components/type/projectType";



type UserType = Awaited<ReturnType<typeof getUsers>>;

export default function Calendar() {
  const [events, setEvents] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserType>([]);
  const [loading, setLoading] = useState(true);
  const { data: DataCalendar, isLoading: loadingCalendar } = useEvent();
  const kontak = useMemo(() => DataCalendar, [DataCalendar]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ev, us] = [kontak, getUsers()];
        if (!cancelled) {
          setEvents(ev);
          // setUsers(us);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    // boleh ganti dengan skeleton kamu
    return (
      <div className="w-full border border-andrika rounded-xl p-4">
        <div className="animate-pulse text-sm text-muted-foreground">Loading calendar…</div>
      </div>
    );
  }

  return (
    <CalendarProvider events={events} view="month">
      <DndProvider>
        <div className="w-full shadow-andrika border-[1.5px] border-andrika bg-lightblue-soft rounded-xl">
          <CalendarHeader />
          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}