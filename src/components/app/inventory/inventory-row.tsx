"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { ProjectContext } from "@/contexts/project-context";
import { useAddProjectLabelToResourcesMutation } from "@/lib/app/project/project-mutation";
import { RESOURCES } from "@/lib/k8s/k8s-constant";
import { convertToResourceTarget, createK8sContext } from "@/lib/k8s/k8s-utils";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";

interface InventoryRowProps {
  resource: AnyKubernetesResource;
}

// Helper to map kind (e.g., 'Deployment') to resource key (e.g., 'deployment')
function kindToResourceKey(kind: string): keyof typeof RESOURCES {
  return kind.toLowerCase() as keyof typeof RESOURCES;
}

export function InventoryRow({ resource }: InventoryRowProps) {
  const name = resource.metadata?.name || "Unknown";
  const kind = resource.kind || "Unknown";

  const context = createK8sContext();
  const { projectName } = use(ProjectContext);

  const addProjectLabelToResources =
    useAddProjectLabelToResourcesMutation(context);

  const handleAdd = () => {
    const resourceKey = kindToResourceKey(kind);
    const resourceConfig = RESOURCES[resourceKey];
    if (!resourceConfig) {
      return;
    }
    const resourceTarget = convertToResourceTarget(resource, resourceConfig);
    if (!resourceTarget) {
      return;
    }
    addProjectLabelToResources.mutate({
      projectName: projectName || "",
      resources: [resourceTarget],
    });
  };

  return (
    <div className="flex min-h-0 items-center justify-between rounded border px-3 py-1.5 text-sm hover:bg-muted/50">
      <div className="flex items-center gap-2 truncate">
        <span className="truncate font-medium" title={name}>
          {name}
        </span>
        <span className="text-muted-foreground">({kind})</span>
      </div>
      <Button onClick={handleAdd} size="sm">
        Add
      </Button>
    </div>
  );
}
