"use client";

import { useInventories } from "@/hooks/app/inventory/use-inventories";
import { InventoryRow } from "@/components/app/inventory/inventory-row";
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
import { ChevronDown, Plus } from "lucide-react";
import AddDevbox from "./resources/add-devbox";
import AddCluster from "./resources/add-cluster";
import AddDeploy from "./resources/add-deploy";
import AddObjectStorage from "./resources/add-objectstorage";
import { AddResourceDropZone } from "./add-resource-drop-zone";
import { useState, useMemo } from "react";
import type { AnyKubernetesResource } from "@/lib/k8s/schemas";

// Define the resource creation options
const CREATION_OPTIONS = [
  {
    key: "devbox",
    label: "DevBox",
    createComponent: AddDevbox,
  },
  {
    key: "cluster",
    label: "Cluster",
    createComponent: AddCluster,
  },
  {
    key: "deployment",
    label: "Deploy",
    createComponent: AddDeploy,
  },
  {
    key: "objectstoragebucket",
    label: "Object Storage",
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
    if (selectedCreationOption === optionKey) {
      // Toggle off if same option clicked
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* Drop Zone at the top */}
      <div className="flex-shrink-0 mb-4">
        <AddResourceDropZone />
      </div>

      {/* Resource Creation Section */}
      <div className="flex-shrink-0 mb-4">
        <Collapsible open={isCreationOpen} onOpenChange={setIsCreationOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-medium">Create New Resource</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isCreationOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2">
            {/* Creation Option Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {CREATION_OPTIONS.map((option) => (
                <Button
                  key={option.key}
                  variant={
                    selectedCreationOption === option.key
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handleCreationOptionClick(option.key)}
                  className="justify-start"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Creation Component Content */}
            {selectedCreationComponent && (
              <div className="border rounded-lg p-4 bg-background">
                {(() => {
                  const Component = selectedCreationComponent;
                  return <Component />;
                })()}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex-shrink-0 mb-4">
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

      {/* Resource List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="mb-2 text-sm text-muted-foreground">
          Found {filteredResources.length} resource
          {filteredResources.length !== 1 ? "s" : ""}
        </div>

        {filteredResources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No resources found matching your criteria
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-2 pr-2">
              {filteredResources.map((resource, index) => (
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
