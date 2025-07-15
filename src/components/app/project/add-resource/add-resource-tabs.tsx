"use client";

import { useInventories } from "@/hooks/app/inventory/use-inventories";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Plus,
  Database,
  Server,
  Package,
  HardDrive,
} from "lucide-react";
import AddDevbox from "./resources/add-devbox";
import AddCluster from "./resources/add-cluster";
import AddDeploy from "./resources/add-deploy";
import AddObjectStorage from "./resources/add-objectstorage";
import { AddResourceDropZone } from "./add-resource-drop-zone";
import { ResourceCards } from "./resource-cards";
import { useState, useMemo } from "react";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";

// Define the resource creation options
const CREATION_OPTIONS = [
  {
    key: "devbox",
    label: "DevBox",
    icon: Server,
    createComponent: AddDevbox,
  },
  {
    key: "cluster",
    label: "Cluster",
    icon: Database,
    createComponent: AddCluster,
  },
  {
    key: "deployment",
    label: "Deploy",
    icon: Package,
    createComponent: AddDeploy,
  },
  {
    key: "objectstoragebucket",
    label: "Object Storage",
    icon: HardDrive,
    createComponent: AddObjectStorage,
  },
];

// Define resource types for filtering
const RESOURCE_TYPES = [
  { value: "all", label: "All Resources" },
  { value: "devbox", label: "DevBoxes" },
  { value: "cluster", label: "Clusters" },
  { value: "deployment", label: "Deployments" },
  { value: "objectstoragebucket", label: "Object Storage" },
];

export function AddResourceTabs() {
  const inventories = useInventories();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResourceType, setSelectedResourceType] = useState("all");
  const [selectedCreationOption, setSelectedCreationOption] = useState<
    string | null
  >(null);
  const [isCreationOpen, setIsCreationOpen] = useState(false);

  // Flatten all resources into a single array with type information
  const allResources = useMemo(() => {
    if (!inventories.data) return [];

    const resources: (AnyKubernetesResource & { resourceType: string })[] = [];

    // Add devboxes
    inventories.data.devboxes.forEach((resource) => {
      resources.push({ ...resource, resourceType: "devbox" });
    });

    // Add clusters
    inventories.data.clusters.forEach((resource) => {
      resources.push({ ...resource, resourceType: "cluster" });
    });

    // Add deployments
    inventories.data.deployments.forEach((resource) => {
      resources.push({ ...resource, resourceType: "deployment" });
    });

    // Add object storage
    inventories.data.objectstorages.forEach((resource) => {
      resources.push({ ...resource, resourceType: "objectstoragebucket" });
    });

    return resources;
  }, [inventories.data]);

  // Filter resources based on search term and resource type
  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
      // Filter by resource type
      if (
        selectedResourceType !== "all" &&
        resource.resourceType !== selectedResourceType
      ) {
        return false;
      }

      // Filter by search term
      const name = resource.metadata?.name || "";
      const kind = resource.kind || "";
      const searchLower = searchTerm.toLowerCase();

      return (
        name.toLowerCase().includes(searchLower) ||
        kind.toLowerCase().includes(searchLower)
      );
    });
  }, [allResources, searchTerm, selectedResourceType]);

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

  const handleCreationOptionClick = (optionKey: string) => {
    if (selectedCreationOption === optionKey && isCreationOpen) {
      // Toggle off if same option clicked and already open
      setSelectedCreationOption(null);
      setIsCreationOpen(false);
    } else {
      // Select new option and open
      setSelectedCreationOption(optionKey);
      setIsCreationOpen(true);
    }
  };

  const selectedCreationComponent = CREATION_OPTIONS.find(
    (option) => option.key === selectedCreationOption
  )?.createComponent;

  return (
    <div className="h-full flex flex-col overflow-hidden space-y-4">
      {/* Drop Zone at the top */}
      <div className="flex-shrink-0">
        <AddResourceDropZone />
      </div>

      {/* Main bordered block for search/filter, create new, and resource list */}
      <div className="flex-1 min-h-0 overflow-hidden border rounded-lg bg-background flex flex-col">
        {/* Search and Filter Controls */}
        <div className="flex-shrink-0 p-4 pb-2">
          <div className="flex gap-4">
            <Input
              className="flex-1"
              placeholder="Filter resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              value={selectedResourceType}
              onValueChange={setSelectedResourceType}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Create Resource Section (bordered, buttons next to label) */}
        <div className="flex-shrink-0 px-4 pt-0 pb-2">
          <Collapsible open={isCreationOpen} onOpenChange={setIsCreationOpen}>
            <div className="py-3 border rounded-lg flex items-center justify-between bg-background">
              <span className="text-sm font-medium text-muted-foreground flex items-center">
                New:
                <span className="flex items-center gap-1 ml-2">
                  {CREATION_OPTIONS.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Button
                        key={option.key}
                        variant={
                          selectedCreationOption === option.key &&
                          isCreationOpen
                            ? "default"
                            : "ghost"
                        }
                        size="sm"
                        onClick={() => handleCreationOptionClick(option.key)}
                        className="h-7 px-2 text-xs"
                      >
                        <IconComponent className="w-3 h-3 mr-1" />
                        {option.label}
                      </Button>
                    );
                  })}
                </span>
              </span>
            </div>
            <CollapsibleContent>
              {selectedCreationComponent && (
                <div className="pt-2">
                  {(() => {
                    const Component = selectedCreationComponent;
                    return <Component />;
                  })()}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Resource List (no border, no margin) */}
        <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4 pt-0 flex flex-col">
          {/* Resource count */}
          {/* Scrollable resource list with hidden scrollbar */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="h-full overflow-y-auto pr-2 scrollbar-hide">
              <ResourceCards resources={filteredResources} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
