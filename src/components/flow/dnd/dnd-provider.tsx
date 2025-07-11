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
    if (!_.isNil(event.over?.data.current?.projectName)) {
      addToProjectMutation.mutate({
        resources: [event.active.data.current?.resourceTarget],
        projectName: event.over?.data.current?.projectName,
      });
      toast.success(
        `Resource added to project ${event.over?.data.current?.projectName}`
      );
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
