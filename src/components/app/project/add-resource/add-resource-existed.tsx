"use client";

import { useMemo } from "react";
import { useInventories } from "@/hooks/app/inventory/use-inventories";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";
import { InventoryRow } from "@/components/app/inventory/inventory-row";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddResourceExisted() {
  const inventories = useInventories();

  // Flatten all resource arrays into a single array
  const flattenedResources = useMemo(() => {
    if (!inventories.data) return [];

    const resources: AnyKubernetesResource[] = [];

    // Add all resources from each resource type array
    resources.push(...inventories.data.devboxes);
    resources.push(...inventories.data.clusters);
    resources.push(...inventories.data.objectstorages);
    resources.push(...inventories.data.deployments);
    // resources.push(...inventories.data.statefulsets);
    // resources.push(...inventories.data.cronjobs);

    return resources;
  }, [inventories.data]);

  if (inventories.isLoading) {
    return (
      <div className="rounded-lg border-2 border-muted border-dashed p-8 text-center">
        <p className="text-muted-foreground">Loading resources...</p>
      </div>
    );
  }

  if (inventories.isError) {
    return (
      <div className="rounded-lg border-2 border-destructive border-dashed p-8 text-center">
        <p className="text-destructive">
          Failed to load resources:{" "}
          {inventories.errors.map((e) => e.message).join(", ")}
        </p>
      </div>
    );
  }

  if (flattenedResources.length === 0) {
    return (
      <div className="rounded-lg border-2 border-muted border-dashed p-8 text-center">
        <p className="text-muted-foreground">No resources found in inventory</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex-shrink-0 text-muted-foreground text-sm">
        Found {flattenedResources.length} resource
        {flattenedResources.length !== 1 ? "s" : ""}
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 pr-2">
          {flattenedResources.map((resource, index) => (
            <InventoryRow
              key={`${resource.kind}-${resource.metadata?.name}-${index}`}
              resource={resource}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
