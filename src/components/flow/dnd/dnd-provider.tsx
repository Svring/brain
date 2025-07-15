"use client";

import { type ReactNode } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useAddToProjectMutation } from "@/lib/app/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { toast } from "sonner";

export function DndProvider({ children }: { children: ReactNode }) {
  const addToProjectMutation = useAddToProjectMutation(createK8sContext());

  function handleDragEnd(event: any) {
    const { active, over } = event;
    console.log("handleDragEnd", active, over);

    // If no drop target, bail early
    if (!over) return;

    // ------------------------------------------------------------------
    // Resource Drop-Zone (collecting resources before batch add)
    // ------------------------------------------------------------------
    if (over.id === "resource-drop-zone") {
      // Let the drop-zone manage its own state via provided onDrop callback.
      if (typeof over.data.current?.onDrop === "function") {
        over.data.current.onDrop(event);
      }
      return; // handled
    }

    // ------------------------------------------------------------------
    // Project Flow – add resource(s) to project graph
    // ------------------------------------------------------------------

    // projectName is stored on the droppable (project-flow) or, for batch-add
    // button, may come from the draggable itself.
    const projectName =
      over.data.current?.projectName ?? active.data.current?.projectName;

    if (!projectName) return; // not a project target

    // Figure out which resources were dropped.
    let resources: any[] = [];

    // Batch add (array of resources)
    if (Array.isArray(active.data.current?.resources)) {
      resources = active.data.current.resources;
    }

    // Single resourceTarget
    if (active.data.current?.resourceTarget) {
      resources = [active.data.current.resourceTarget];
    }

    if (resources.length === 0) return; // nothing to add

    addToProjectMutation.mutate(
      {
        resources,
        projectName,
      },
      {
        onSuccess: () =>
          toast.success(
            `Added ${resources.length} resource$${
              resources.length === 1 ? "" : "s"
            } to project ${projectName}`
          ),
        onError: () => toast.error("Failed to add resources to project"),
      }
    );
  }

  return <DndContext onDragEnd={handleDragEnd}>{children}</DndContext>;
}
