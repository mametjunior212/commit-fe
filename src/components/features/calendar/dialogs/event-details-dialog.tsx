"use client";

import { format, parseISO } from "date-fns";
import { Calendar, Clock, Text, User } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "@/components/features/calendar/contexts/calendar-context";
import { formatTime } from "@/components/features/calendar/helpers";
import { id } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Project } from '@/components/type/projectType';

interface IProps {
  event: Project;
  children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const { use24HourFormat, removeEvent } = useCalendar();

  const deleteEvent = (eventId: string) => {
    try {
      removeEvent(eventId);
      toast.success("Event deleted successfully.");
    } catch {
      toast.error("Error deleting event.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 p-4">
            {
              event.user != null || event?.user && "name" in event.user && event.user.name && (
                <div className="flex items-start gap-2">
                  <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pembuat Event</p>
                    <p className="text-sm text-muted-foreground">
                      {(event?.user && "name" in event.user && event.user.name) ?? ""}
                    </p>
                  </div>
                </div>)
            }


            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Mulai Dari</p>
                <p className="text-sm text-muted-foreground">
                  {format(startDate, "EEEE dd MMMM", { locale: id })}
                  <span className="mx-1">Pada Jam</span>
                  {formatTime(parseISO(event.startDate), use24HourFormat)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Berakhir di</p>
                <p className="text-sm text-muted-foreground">
                  {format(endDate, "EEEE dd MMMM", { locale: id })}
                  <span className="mx-1">Pada Jam</span>
                  {formatTime(parseISO(event.endDate), use24HourFormat)}
                </p>
              </div>
            </div>
            {event.description !== null || event.description !== "" &&
              <div className="flex items-start gap-2">
                <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Deskripsi</p>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              </div>}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2">
          <Button variant="primary"><Link to={`/event/${event.uuid}`}>View Detail Event</Link></Button>
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
