"use client";

import { createContext, useState, type ReactNode } from "react";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface FlowContextType {
  draggedResource: {
    id: string;
    resourceTarget: CustomResourceTarget | BuiltinResourceTarget;
  } | null;
  setDraggedResource: (
    resource: {
      id: string;
      resourceTarget: CustomResourceTarget | BuiltinResourceTarget;
    } | null
  ) => void;
}

export const FlowContext = createContext<FlowContextType | undefined>(
  undefined
);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [draggedResource, setDraggedResource] = useState<{
    id: string;
    resourceTarget: CustomResourceTarget | BuiltinResourceTarget;
  } | null>(null);

  return (
    <FlowContext.Provider value={{ draggedResource, setDraggedResource }}>
      {children}
    </FlowContext.Provider>
  );
}
