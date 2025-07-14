"use client";

import { type ReactNode } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useAddToProjectMutation } from "@/lib/app/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import _ from "lodash";
import { toast } from "sonner";

export function DndProvider({ children }: { children: ReactNode }) {
  const addToProjectMutation = useAddToProjectMutation(createK8sContext());

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over) return;

    // Handle drop on project flow (existing functionality)
    if (over.data.current?.projectName && active.data.current?.resourceTarget) {
      addToProjectMutation.mutate({
        resources: [active.data.current.resourceTarget],
        projectName: over.data.current.projectName,
      });
      toast.success(
        `Resource added to project ${over.data.current.projectName}`
      );
      return;
    }

    // Handle drop on resource drop zone
    if (
      over.id === "resource-drop-zone" &&
      active.data.current?.resourceTarget
    ) {
      // The drop zone component will handle this via its own onDrop callback
      // We just need to trigger the callback if it exists
      if (over.data.current?.onDrop) {
        over.data.current.onDrop(event);
      }
      return;
    }
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
