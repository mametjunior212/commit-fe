import Calendar from "@/components/features/calendar/calendar";
import { CalendarSkeleton } from "@/components/features/calendar/skeletons/calendar-skeleton";
import Navigation from "@/components/Navigation";
import { Suspense, useState } from "react";
import "../components/features/calendar/calendar.css";
import CustomCursor from "@/components/CustomCursor";

const CalendarPage = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({
            x: (e.clientX - window.innerWidth / 2) / 30,
            y: (e.clientY - window.innerHeight / 2) / 30,
        });
    };
    return (
        <div className="min-h-screen bg-background" onMouseMove={handleMouseMove}>
            {/* <CustomCursor /> */}
            <Navigation />
            <section className="pt-16 pb-16 md:pt-[3rem] md:pb-24 relative overflow-hidden">
                <main className="flex max-h-screen my-10 flex-col">
                    <div className="container h-screen p-4 md:mx-auto">
                        <Suspense fallback={<CalendarSkeleton />}>
                            <Calendar />
                        </Suspense>
                    </div>
                </main>
            </section>
        </div>
    )
}

export default CalendarPage;