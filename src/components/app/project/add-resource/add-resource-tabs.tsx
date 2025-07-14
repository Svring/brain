"use client";

import { useInventories } from "@/hooks/app/inventory/use-inventories";
import { InventoryRow } from "@/components/app/inventory/inventory-row";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddDevbox from "./resources/add-devbox";
import AddCluster from "./resources/add-cluster";
import AddDeploy from "./resources/add-deploy";
import AddObjectStorage from "./resources/add-objectstorage";
import { AddResourceDropZone } from "./add-resource-drop-zone";
import { useMemo } from "react";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";

// Define the resource options with their corresponding creation components
const RESOURCE_OPTIONS = [
  {
    key: "devbox",
    label: "DevBox",
    createComponent: AddDevbox,
    getResources: (inventories: any) => inventories?.devboxes || [],
  },
  {
    key: "cluster",
    label: "Cluster",
    createComponent: AddCluster,
    getResources: (inventories: any) => inventories?.clusters || [],
  },
  {
    key: "deployment",
    label: "Deploy",
    createComponent: AddDeploy,
    getResources: (inventories: any) => inventories?.deployments || [],
  },
  {
    key: "objectstoragebucket",
    label: "Object Storage",
    createComponent: AddObjectStorage,
    getResources: (inventories: any) => inventories?.objectstorages || [],
  },
];

function ResourceTabContent({
  createComponent: CreateComponent,
  resources,
}: {
  createComponent: React.ComponentType;
  resources: AnyKubernetesResource[];
}) {
  return (
    <div className="space-y-4">
      {/* Creation Panel */}
      <div className="border rounded-lg p-4 bg-muted/50">
        <h4 className="font-medium mb-3">Create New</h4>
        <CreateComponent />
      </div>

      {/* Inventory Table */}
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-3">
          Existing Resources ({resources.length})
        </h4>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No existing resources found
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-2">
              {resources.map((resource, index) => (
                <InventoryRow
                  key={`${resource.kind}-${resource.metadata?.name}-${index}`}
                  resource={resource}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

export function AddResourceTabs() {
  const inventories = useInventories();

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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Drop Zone at the top */}
      <div className="flex-shrink-0 mb-4">
        <AddResourceDropZone />
      </div>

      {/* Resource Tabs */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <Tabs defaultValue="devbox" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            {RESOURCE_OPTIONS.map((option) => {
              const resources = option.getResources(inventories.data);
              return (
                <TabsTrigger
                  key={option.key}
                  value={option.key}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {resources.length} existing
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 min-h-0 overflow-hidden mt-4">
            {RESOURCE_OPTIONS.map((option) => {
              const resources = option.getResources(inventories.data);
              return (
                <TabsContent
                  key={option.key}
                  value={option.key}
                  className="h-full mt-0"
                >
                  <ResourceTabContent
                    createComponent={option.createComponent}
                    resources={resources}
                  />
                </TabsContent>
              );
            })}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
