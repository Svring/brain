"use client";

import { useMemo } from "react";
import type { InventoryByResourceType } from "@/hooks/app/inventory/use-inventories";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import { InventoryRow } from "./inventory-row";

interface InventoryTableProps {
  data: InventoryByResourceType;
}

export function InventoryTable({ data }: InventoryTableProps) {
  // Flatten all resource arrays into a single array
  const flattenedResources = useMemo(() => {
    const resources: AnyKubernetesResource[] = [];

    // Add all resources from each resource type array
    resources.push(...data.devboxes);
    resources.push(...data.clusters);
    resources.push(...data.objectstorages);
    resources.push(...data.deployments);
    resources.push(...data.statefulsets);
    resources.push(...data.cronjobs);

    return resources;
  }, [data]);

  if (flattenedResources.length === 0) {
    return (
      <div className="rounded-lg border-2 border-muted border-dashed p-8 text-center">
        <p className="text-muted-foreground">No resources found in inventory</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex-shrink-0 text-muted-foreground text-sm">
        Found {flattenedResources.length} resource
        {flattenedResources.length !== 1 ? "s" : ""}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-2">
        {flattenedResources.map((resource, index) => (
          <InventoryRow
            key={`${resource.kind}-${resource.metadata?.name}-${index}`}
            resource={resource}
          />
        ))}
      </div>
    </div>
  );
}
