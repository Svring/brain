"use client";

import {
  convertToResourceTarget,
  getResourceConfigFromKind,
} from "@/lib/k8s/k8s-method/k8s-utils";
import type { K8sResource } from "@/lib/k8s/k8s-api/k8s-api-schemas/resource-schemas/kubernetes-resource-schemas";
import { Draggable } from "@/components/flow/dnd/draggable";

export function InventoryRow({ resource }: { resource: K8sResource }) {
  const name = resource.metadata?.name || "Unknown";
  const kind = resource.kind || "Unknown";
  const resourceConfig = getResourceConfigFromKind(kind);

  return (
    <Draggable
      id={`${kind}-${name}`}
      data={{
        resourceTarget: convertToResourceTarget(resource, resourceConfig),
      }}
    >
      <div className="flex items-center gap-2 truncate border p-2 rounded-lg">
        <span className="truncate font-medium" title={name}>
          {name}
        </span>
        <span className="text-muted-foreground">({kind})</span>
      </div>
    </Draggable>
  );
}
