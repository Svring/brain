"use client";

import { type ReactNode } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import _ from "lodash";
import { DragOverlay, useDndMonitor } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
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
            <div className="border rounded-lg py-2 px-4 bg-background shadow-lg flex items-center gap-3 text-sm pointer-events-none min-w-[200px]">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">
                {activeDrag.resources.length} resource
                {activeDrag.resources.length === 1 ? "" : "s"}
              </span>
            </div>
          ) : // Else dragging single resource card
          activeDrag.resourceName ? (
            <div className="border rounded-lg py-2 px-4 bg-background shadow-lg flex items-center gap-3 text-sm pointer-events-none min-w-[250px]">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
              {/* Resource icon placeholder */}
              <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-muted-foreground">
                  {activeDrag.resourceKind?.charAt(0) || "R"}
                </span>
              </div>
              <span className="font-medium truncate flex-1">
                {activeDrag.resourceName}
              </span>
              {activeDrag.resourceKind && (
                <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded">
                  {activeDrag.resourceKind}
                </span>
              )}
            </div>
          ) : null
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
