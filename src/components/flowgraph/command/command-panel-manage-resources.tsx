"use client";

import { ArrowLeft, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";
import {
  useProjectState,
} from "@/contexts/project/project-context";
import { ResourceObject } from "@/contexts/project/project-context";
import { useState } from "react";
import { useResourcesLifecycle } from "@/hooks/sealos/resource/use-resources-lifecycle";
import { toast } from "sonner";

interface ManageResourcesProps {
  onBack: () => void;
}

export function ManageResources({ onBack }: ManageResourcesProps) {
  const { selectedProject, selectedProjectResources } = useProjectState();
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set()
  );

  // Initialize lifecycle hook
  const { batchStart, batchPause, batchDelete, isPerformingBatchAction } =
    useResourcesLifecycle();

  // Helper function to get resource key for selection
  const getResourceKey = (resource: ResourceObject) =>
    `${resource.name}-${resource.kind}`;

  // Selection handlers
  const handleSelectResource = (resource: ResourceObject, checked: boolean) => {
    const resourceKey = getResourceKey(resource);
    const newSelected = new Set(selectedResources);

    if (checked) {
      newSelected.add(resourceKey);
    } else {
      newSelected.delete(resourceKey);
    }

    setSelectedResources(newSelected);
  };

  const handleSelectAll = (checked: CheckedState) => {
    if (checked === true && selectedProjectResources) {
      const allKeys = selectedProjectResources.map(getResourceKey);
      setSelectedResources(new Set(allKeys));
    } else {
      setSelectedResources(new Set());
    }
  };

  // Get selected resource objects
  const getSelectedResourceObjects = () => {
    if (!selectedProjectResources) return [];
    return selectedProjectResources.filter((resource) =>
      selectedResources.has(getResourceKey(resource))
    );
  };

  // Batch operation handlers
  const handleBatchStart = async () => {
    const selectedResourceObjects = getSelectedResourceObjects();
    await batchStart(selectedResourceObjects);
    setSelectedResources(new Set()); // Clear selection after batch operation
  };

  const handleBatchPause = async () => {
    const selectedResourceObjects = getSelectedResourceObjects();
    await batchPause(selectedResourceObjects);
    setSelectedResources(new Set()); // Clear selection after batch operation
  };

  const handleBatchDelete = async () => {
    const selectedResourceObjects = getSelectedResourceObjects();
    if (selectedResourceObjects.length === 0) {
      toast.error("No resources selected");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedResourceObjects.length} resource(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    await batchDelete(selectedResourceObjects);
    setSelectedResources(new Set()); // Clear selection after batch operation
  };

  const getResourceIcon = (kind: string) => {
    switch (kind.toLowerCase()) {
      case "devbox":
        return "https://devbox.bja.sealos.run/logo.svg";
      case "cluster":
        return "https://dbprovider.bja.sealos.run/logo.svg";
      case "deployment":
        return "https://applaunchpad.bja.sealos.run/logo.svg";
      case "statefulset":
        return "https://applaunchpad.bja.sealos.run/logo.svg";
      case "objectstoragebucket":
        return "https://objectstorage.bja.sealos.run/logo.svg";
      default:
        return "https://sealos.io/img/logo.svg";
    }
  };

  const getResourceTypeLabel = (kind: string) => {
    switch (kind.toLowerCase()) {
      case "devbox":
        return "Devbox";
      case "cluster":
        return "Database";
      case "deployment":
        return "App Launchpad";
      case "objectstoragebucket":
        return "Object Storage";
      default:
        return kind;
    }
  };

  // Helper function to truncate resource names
  const truncateName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;
    return `${name.slice(0, maxLength - 3)}...`;
  };

  // Check if all resources are selected
  const isAllSelected =
    selectedProjectResources &&
    selectedProjectResources.length > 0 &&
    selectedResources.size === selectedProjectResources.length;

  // Check if some resources are selected
  const isSomeSelected =
    selectedResources.size > 0 &&
    selectedResources.size < (selectedProjectResources?.length || 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold">Manage Resources</h2>
              <p className="text-sm text-muted-foreground">
                {selectedProject
                  ? `Project: ${selectedProject}`
                  : "No project selected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Actions Bar */}
      {selectedProjectResources && selectedProjectResources.length > 0 && (
        <div className="border-b border-border p-3 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isAllSelected || false}
                onCheckedChange={handleSelectAll}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                ref={(node) => {
                  if (node && "indeterminate" in node) {
                    (node as HTMLInputElement).indeterminate = isSomeSelected;
                  }
                }}
              />
              <span className="text-sm font-medium">
                {selectedResources.size === 0
                  ? "Select all"
                  : `${selectedResources.size} of ${selectedProjectResources.length} selected`}
              </span>
            </div>

            {selectedResources.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchStart}
                  disabled={isPerformingBatchAction}
                  // className="h-8"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchPause}
                  disabled={isPerformingBatchAction}
                  // className="h-8"
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchDelete}
                  disabled={isPerformingBatchAction}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedProject ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-muted-foreground">
              <p className="text-lg font-medium">No Project Selected</p>
              <p className="text-sm">
                Please select a project to manage its resources.
              </p>
            </div>
          </div>
        ) : !selectedProjectResources ||
          selectedProjectResources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-muted-foreground">
              <p className="text-lg font-medium">No Resources Found</p>
              <p className="text-sm">
                This project doesn't have any resources yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {selectedProjectResources.map((resource, index) => {
              const resourceKey = getResourceKey(resource);
              const isSelected = selectedResources.has(resourceKey);

              return (
                <div
                  key={`${resource.name}-${resource.kind}-${index}`}
                  className={`flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors ${
                    isSelected ? "bg-muted/30" : ""
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectResource(resource, checked === true)
                    }
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />

                  <img
                    src={getResourceIcon(resource.kind)}
                    alt={`${resource.kind} icon`}
                    className="h-6 w-6 rounded flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {getResourceTypeLabel(resource.kind)}
                      </Badge>
                      <span
                        className="font-medium text-sm truncate"
                        title={resource.name}
                      >
                        {truncateName(resource.name, 25)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
