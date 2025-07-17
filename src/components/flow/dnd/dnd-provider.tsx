"use client";

import { type ReactNode } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import _ from "lodash";
import { DragOverlay, useDndMonitor } from "@dnd-kit/core";
import { Box, Boxes, GripVertical } from "lucide-react";
import { useState } from "react";

export function DndProvider({ children }: { children: ReactNode }) {
  // Track active drag data for a unified overlay
  const [activeDrag, setActiveDrag] = useState<any | null>(null);

  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event as any;
    setActiveDrag(active?.data?.current || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over) {
      _.invoke(over, "data.current.onDrop", event);

      // Clear drop zone if resources were successfully added to project
      if (over.id === "project-flow") {
        const dropZoneElement = document.querySelector(
          '[data-drop-zone-id="add-resource-drop-zone"]'
        );
        if (dropZoneElement) {
          // Trigger a custom event to clear the drop zone
          dropZoneElement.dispatchEvent(new CustomEvent("clearResources"));
        }
      }
    }
    setActiveDrag(null);
  };

  const handleDragCancel = () => {
    setActiveDrag(null);
  };

  // TODO: optimize the ui of draggable
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      {/* Unified drag overlay */}
      <DragOverlay>
        {activeDrag ? (
          // If dragging collection of resources (from drop zone)
          _.isArray(activeDrag.resources) ? (
            <div className="w-10 h-10 border rounded-lg bg-background shadow-lg flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <Boxes />
              </div>
            </div>
          ) : // Else dragging single resource card
          activeDrag.resourceName ? (
            <div className="w-10 h-10 border rounded-lg bg-background shadow-lg flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                <Box />
              </div>
            </div>
          ) : null
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
