"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droppable } from "@/components/flow/dnd/droppable";
import { Draggable } from "@/components/flow/dnd/draggable";
import { X, Plus, Package } from "lucide-react";
import { useAddToProjectMutation } from "@/lib/app/project/project-method/project-mutation";
import { createK8sContext } from "@/lib/k8s/k8s-method/k8s-utils";
import { ProjectContext } from "@/contexts/project-context";
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
  const { activeProject } = use(ProjectContext);

  const k8sContext = createK8sContext();
  const addToProjectMutation = useAddToProjectMutation(k8sContext);

  const handleDrop = (event: any) => {
    const droppedData = event.active?.data?.current;
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

  const addAllToProject = async () => {
    if (!activeProject || collectedResources.length === 0) return;

    try {
      await addToProjectMutation.mutateAsync({
        resources: collectedResources.map((r) => r.resourceTarget),
        projectName: activeProject,
      });

      // Clear the drop zone after successful addition
      setCollectedResources([]);
      toast.success(`Added ${collectedResources.length} resources to project`);
    } catch (error) {
      toast.error("Failed to add resources to project");
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Droppable
        id="resource-drop-zone"
        data={{ onDrop: handleDrop }}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 min-h-[120px] transition-colors"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <Package className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">
            Drag resources here to collect them
          </p>
          <p className="text-xs text-muted-foreground/70 text-center mt-1">
            {collectedResources.length} resource
            {collectedResources.length !== 1 ? "s" : ""} collected
          </p>
        </div>
      </Droppable>

      {/* Collected Resources */}
      {collectedResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Collected Resources</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {collectedResources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 text-sm"
              >
                <Badge variant="secondary" className="text-xs">
                  {resource.kind}
                </Badge>
                <span className="font-medium">{resource.displayName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeResource(resource.id)}
                  className="h-4 w-4 p-0 hover:bg-destructive/10"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {/* Draggable Batch Add Button */}
          <Draggable
            id="batch-add-resources"
            data={{
              type: "batch-add",
              resources: collectedResources.map((r) => r.resourceTarget),
              projectName: activeProject,
            }}
          >
            <Button
              className="w-full"
              disabled={
                !activeProject ||
                collectedResources.length === 0 ||
                addToProjectMutation.isPending
              }
              onClick={addAllToProject}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addToProjectMutation.isPending
                ? "Adding..."
                : `Add ${collectedResources.length} Resource${
                    collectedResources.length !== 1 ? "s" : ""
                  } to Project`}
            </Button>
          </Draggable>
        </div>
      )}
    </div>
  );
}
