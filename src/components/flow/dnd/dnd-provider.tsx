"use client";

import { type ReactNode } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";

export function DndProvider({ children }: { children: ReactNode }) {
  function handleDragEnd(event: any) {
    console.log("drag end", event);
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay>
        <div className="flex min-h-0 items-center justify-between rounded border px-3 py-1.5 text-sm bg-background shadow-lg"></div>
      </DragOverlay>
    </DndContext>
  );
}
