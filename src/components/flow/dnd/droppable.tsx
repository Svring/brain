import React from "react";
import { useDroppable } from "@dnd-kit/core";

export function Droppable({
  id,
  children,
  data,
  className,
}: {
  id: string;
  children: React.ReactNode;
  data?: any;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: data,
  });

  return (
    <div ref={setNodeRef} className={`${className || ""}`}>
      {children}
    </div>
  );
}
