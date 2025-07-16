"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droppable } from "@/components/flow/dnd/droppable";
import { X, Plus, Package } from "lucide-react";
import { toast } from "sonner";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

type ResourceTarget = CustomResourceTarget | BuiltinResourceTarget;

interface CollectedResource {
  id: string;
  resourceTarget: ResourceTarget;
  displayName: string;
  kind: string;
}

export function AddResourceDropZone() {
  const [collectedResources, setCollectedResources] = useState<
    CollectedResource[]
  >([]);

  const handleDrop = (event: any) => {
    const droppedData = event.active?.data?.current;
    console.log("droppedData", droppedData);
    if (!droppedData?.resourceTarget) return;

    const resourceTarget = droppedData.resourceTarget as ResourceTarget;

    // Create a unique ID for the resource
    const resourceName =
      "name" in resourceTarget ? resourceTarget.name : "unknown";
    const resourceType =
      "resourceType" in resourceTarget
        ? resourceTarget.resourceType
        : "plural" in resourceTarget
        ? resourceTarget.plural
        : "unknown";

    const id = `${resourceType}-${resourceName}`;

    // Check if resource is already collected
    if (collectedResources.some((r) => r.id === id)) {
      toast.info("Resource already added to drop zone");
      return;
    }

    const newResource: CollectedResource = {
      id,
      resourceTarget,
      displayName: resourceName || "Unknown",
      kind: resourceType,
    };

    setCollectedResources((prev) => [...prev, newResource]);
    toast.success(`Added ${newResource.displayName} to drop zone`);
  };

  const removeResource = (id: string) => {
    setCollectedResources((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = () => {
    setCollectedResources([]);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Droppable
        id="resource-drop-zone"
        data={{ onDrop: handleDrop }}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-[120px] transition-colors"
      >
        {/* Show instructions only if no resources are collected */}
        {collectedResources.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <Package className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Drag resources here to collect them
            </p>
            <p className="text-xs text-muted-foreground/70 text-center mt-1">
              0 resources collected
            </p>
          </div>
        )}
        {/* Collected resource bars inside the drop zone */}
        {collectedResources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-0">
            {collectedResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center gap-2 border  rounded-lg p-1 text-xs"
              >
                <span className="text-xs">{resource.kind}: </span>
                <span className="font-medium">{resource.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(resource.id)}
                  className="h-2 w-2 p-0 hover:bg-destructive/10"
                  aria-label={`Remove ${resource.displayName}`}
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Droppable>
    </div>
  );
}
