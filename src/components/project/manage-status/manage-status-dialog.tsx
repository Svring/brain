"use client";

import { useMemo, useState } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjectState } from "@/contexts/project/project-context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ManageStatusDialogProps {
  closeDialog?: () => void;
}

interface ResourceStatus {
  id: string;
  name: string;
  kind: string;
  status: string;
  canStart: boolean;
  canPause: boolean;
  isStarting: boolean;
  isPausing: boolean;
}

export default function ManageStatusDialog({ closeDialog }: ManageStatusDialogProps) {
  const { selectedProjectResources } = useProjectState();
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  // Prepare resource status data
  const resourceStatuses: ResourceStatus[] = useMemo(() => {
    if (!selectedProjectResources || !Array.isArray(selectedProjectResources)) {
      return [];
    }

    return selectedProjectResources.map((resource) => {
      const status = resource.status?.phase || resource.status?.conditions?.[0]?.type || "Unknown";
      
      // Determine if resource can be started/paused based on its type and current status
      let canStart = false;
      let canPause = false;

      if (resource.kind === "Devbox") {
        canStart = status !== "Running";
        canPause = status === "Running";
      } else if (resource.kind === "Launchpad") {
        canStart = status !== "Running";
        canPause = status === "Running";
      } else if (resource.kind === "Cluster") {
        canStart = status !== "Running";
        canPause = status === "Running";
      }

      return {
        id: resource.name,
        name: resource.name,
        kind: resource.kind,
        status,
        canStart,
        canPause,
        isStarting: false,
        isPausing: false,
      };
    });
  }, [selectedProjectResources]);

  const handleSelectAll = () => {
    if (selectedResources.size === resourceStatuses.length) {
      setSelectedResources(new Set());
    } else {
      setSelectedResources(new Set(resourceStatuses.map(r => r.id)));
    }
  };

  const handleSelectResource = (resourceId: string) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(resourceId)) {
      newSelected.delete(resourceId);
    } else {
      newSelected.add(resourceId);
    }
    setSelectedResources(newSelected);
  };

  const handleStartSelected = () => {
    const startableSelected = resourceStatuses.filter(r => 
      selectedResources.has(r.id) && r.canStart
    );
    
    if (startableSelected.length === 0) {
      toast.error("No selected resources can be started");
      return;
    }

    toast.success(`Starting ${startableSelected.length} selected resource(s)`);
    closeDialog?.();
  };

  const handlePauseSelected = () => {
    const pausableSelected = resourceStatuses.filter(r => 
      selectedResources.has(r.id) && r.canPause
    );
    
    if (pausableSelected.length === 0) {
      toast.error("No selected resources can be paused");
      return;
    }

    toast.success(`Pausing ${pausableSelected.length} selected resource(s)`);
    closeDialog?.();
  };

  const handleStartAll = () => {
    const startableResources = resourceStatuses.filter(r => r.canStart);
    if (startableResources.length === 0) {
      toast.error("No resources available to start");
      return;
    }

    toast.success(`Starting ${startableResources.length} resource(s)`);
    closeDialog?.();
  };

  const handlePauseAll = () => {
    const pausableResources = resourceStatuses.filter(r => r.canPause);
    if (pausableResources.length === 0) {
      toast.error("No resources available to pause");
      return;
    }

    toast.success(`Pausing ${pausableResources.length} resource(s)`);
    closeDialog?.();
  };

  const handleStartResource = (resource: ResourceStatus) => {
    toast.success(`Starting ${resource.name}`);
  };

  const handlePauseResource = (resource: ResourceStatus) => {
    toast.success(`Pausing ${resource.name}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "stopped":
      case "shutdown":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const hasResources = resourceStatuses.length > 0;
  const startableResources = resourceStatuses.filter(r => r.canStart).length;
  const pausableResources = resourceStatuses.filter(r => r.canPause).length;
  const selectedStartable = resourceStatuses.filter(r => selectedResources.has(r.id) && r.canStart).length;
  const selectedPausable = resourceStatuses.filter(r => selectedResources.has(r.id) && r.canPause).length;

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight">Manage Resources Status</h2>
        <p className="text-muted-foreground">
          Control the lifecycle of your project resources
        </p>
      </div>

      <Separator />

      {/* Bulk Actions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Bulk Actions</h3>
            <p className="text-sm text-muted-foreground">
              Manage all resources at once
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleStartAll}
              disabled={!hasResources || startableResources === 0}
              variant="outline"
              size="sm"
            >
              <Play className="mr-2 h-4 w-4" />
              Start All ({startableResources})
            </Button>
            <Button
              onClick={handlePauseAll}
              disabled={!hasResources || pausableResources === 0}
              variant="outline"
              size="sm"
            >
              <Pause className="mr-2 h-4 w-4" />
              Pause All ({pausableResources})
            </Button>
          </div>
        </div>
        
        {/* Selected Actions */}
        {selectedResources.size > 0 && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Selected Actions</h3>
              <p className="text-sm text-muted-foreground">
                Manage {selectedResources.size} selected resource(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleStartSelected}
                disabled={selectedStartable === 0}
                variant="default"
                size="sm"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Selected ({selectedStartable})
              </Button>
              <Button
                onClick={handlePauseSelected}
                disabled={selectedPausable === 0}
                variant="default"
                size="sm"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause Selected ({selectedPausable})
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Individual Resources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Individual Resources</h3>
          {hasResources && (
            <Button
              onClick={handleSelectAll}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              {selectedResources.size === resourceStatuses.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
        
        {!hasResources ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                No resources found in this project
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {resourceStatuses.map((resource) => (
              <Card 
                key={resource.id} 
                className={cn(
                  "transition-colors hover:bg-muted/50 cursor-pointer",
                  selectedResources.has(resource.id) && "ring-2 ring-primary/20 bg-primary/5"
                )}
                onClick={() => handleSelectResource(resource.id)}
              >
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedResources.has(resource.id)}
                        onChange={() => handleSelectResource(resource.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{resource.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {resource.kind}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getStatusColor(resource.status))}
                          >
                            {resource.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartResource(resource);
                        }}
                        disabled={!resource.canStart || resource.isStarting}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                      >
                        {resource.isStarting ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePauseResource(resource);
                        }}
                        disabled={!resource.canPause || resource.isPausing}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                      >
                        {resource.isPausing ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Pause className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={closeDialog} variant="outline">
          Close
        </Button>
      </div>
    </div>
  );
}
