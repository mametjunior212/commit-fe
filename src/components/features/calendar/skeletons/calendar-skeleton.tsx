import { CalendarHeaderSkeleton } from "@/components/features/calendar/skeletons/calendar-header-skeleton";
import { MonthViewSkeleton } from "@/components/features/calendar/skeletons/month-view-skeleton";

export function CalendarSkeleton() {
  return (
    <div className="container mx-auto">
      <div className="flex h-full flex-col">
        <CalendarHeaderSkeleton />
        <div className="flex-1">
          <MonthViewSkeleton />
        </div>
      </div>
    </div>
  );
}
