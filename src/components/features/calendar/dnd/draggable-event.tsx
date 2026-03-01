import { motion } from "framer-motion";
import type React from "react";
import type { ReactNode } from "react";
import { useDragDrop } from "@/components/features/calendar/contexts/dnd-context";
import { Project } from '@/components/type/projectType';

interface DraggableEventProps {
  event: Project;
  children: ReactNode;
  className?: string;
}

export function DraggableEvent({
  event,
  children,
  className,
}: DraggableEventProps) {
  const { startDrag, endDrag, isDragging, draggedEvent } = useDragDrop();

  const isCurrentlyDragged = isDragging && draggedEvent?.uuid === event.uuid;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className={`${className || ""} ${isCurrentlyDragged ? "opacity-50 cursor-grabbing" : ""}`}
      draggable
      onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e)}
      // onDragStart={(e) => {
      //   (e as DragEvent).dataTransfer!.setData(
      //     "text/plain",
      //     event.id.toString(),
      //   );
      //   startDrag(event);
      // }}
      // onDragEnd={() => {
      //   endDrag();
      // }}
    >
      {children}
    </motion.div>
  );
}
