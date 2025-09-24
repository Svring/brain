"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectState } from "@/contexts/project/project-context";
import { useAuthState } from "@/contexts/auth/auth-context";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";

interface ExistingResourcesProps {
  onBack: () => void;
  onClose?: () => void;
}

interface ResourceItemProps {
  resource: any;
  resourceType: string;
  onToggle: (resource: any, resourceType: string, checked: boolean) => void;
  disabled?: boolean;
  checked?: boolean;
}

function ResourceItem({
  resource,
  resourceType,
  onToggle,
  disabled = false,
  checked = false,
}: ResourceItemProps) {
  const { auth } = useAuthState();
  const defaultRegion = auth?.regionUrl || "bja.sealos.run";

  const getResourceIcon = (resource: any) => {
    const kind = resource.kind?.toLowerCase() || "";
    const icons: { [key: string]: string } = {
      devbox: `https://devbox.${defaultRegion}/logo.svg`,
      cluster:
        CLUSTER_TYPE_ICON_MAP[resource.type] ||
        `https://dbprovider.${defaultRegion}/logo.svg`,
      deployment: `https://applaunchpad.${defaultRegion}/logo.svg`,
      statefulset: `https://applaunchpad.${defaultRegion}/logo.svg`,
      objectstoragebucket: `https://objectstorage.${defaultRegion}/logo.svg`,
    };

    return icons[kind] || "https://sealos.io/img/logo.svg";
  };

  return (
    <div className="flex items-center gap-2 p-2 hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={checked}
        onCheckedChange={(isChecked) =>
          onToggle(resource, resourceType, !!isChecked)
        }
        disabled={disabled}
      />
      <img
        src={getResourceIcon(resource)}
        alt={`${resourceType} icon`}
        className="h-6 w-6 rounded bg-background-tertiary"
      />
      <span className="text-sm truncate" title={resource.name}>
        {resource.name}
      </span>
    </div>
  );
}

export function ExistingResources({ onBack, onClose }: ExistingResourcesProps) {
  const { devbox, cluster, launchpad, project } = useTRPCClients();
  const [activeTab, setActiveTab] = useState("devboxes");
  const [selectedResources, setSelectedResources] = useState<Set<{resource: any, resourceType: string}>>(
    new Set()
  );
  const { selectedProject } = useProjectState();
  const { invalidateQueries } = useInvalidateQueries();

  const { data: devboxes, isLoading: devboxesLoading } = useQuery(
    devbox.list.queryOptions("devbox")
  );
  const { data: clusters, isLoading: clustersLoading } = useQuery(
    cluster.list.queryOptions("cluster")
  );
  const { data: launchpads, isLoading: launchpadsLoading } = useQuery(
    launchpad.list.queryOptions("launchpad")
  );
  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions({
      onSuccess: () => {
        // Invalidate project resources and resource lists
        invalidateQueries(
          [
            devbox.list.queryKey("devbox"),
            cluster.list.queryKey("cluster"),
            launchpad.list.queryKey("launchpad"),
          ],
          true // invalidateProjectResources = true
        );
      },
    })
  );

  const handleToggleResource = (
    resource: any,
    resourceType: string,
    checked: boolean
  ) => {
    const resourceObj = { resource, resourceType };
    setSelectedResources((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(resourceObj);
      } else {
        // Find and remove the matching resource object
        for (const item of newSet) {
          if (item.resource.name === resource.name && item.resourceType === resourceType) {
            newSet.delete(item);
            break;
          }
        }
      }
      return newSet;
    });
  };

  const handleAddToProject = async () => {
    if (!selectedProject) return toast.error("Please select a project.");
    if (!selectedResources.size) return toast.error("No resources selected.");

    try {
      const targets = Array.from(selectedResources).map(({ resource, resourceType }) => {
        return convertResourceTypeToTarget(resourceType, resource.name);
      });
      console.log("targets", targets);
      await addToProjectMutation.mutateAsync({
        resources: targets,
        name: selectedProject,
      });
      toast.success(
        `Added ${selectedResources.size} resource(s) to "${selectedProject}"`
      );
      setSelectedResources(new Set());
      onClose?.();
    } catch (error: any) {
      toast.error(`Failed to add resources: ${error.message}`);
    }
  };

  const renderResourceList = (
    resources: any[] | undefined,
    resourceType: string,
    isLoading: boolean
  ) => {
    if (isLoading)
      return (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
          Loading...
        </div>
      );
    
    // Filter out resources that are already in projects
    const availableResources = resources?.filter((r) => !r.inProject) || [];
    
    if (!resources?.length) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
          <p className="text-sm font-medium">No {resourceType} found</p>
          <p className="text-xs">
            Create a new {resourceType.slice(0, -1)} to get started
          </p>
        </div>
      );
    }
    
    if (!availableResources.length) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
          <p className="text-sm font-medium">All {resourceType} are already in projects</p>
          <p className="text-xs">
            Create a new {resourceType.slice(0, -1)} to add to your project
          </p>
        </div>
      );
    }

    return availableResources.map((resource, index) => {
      const resourceType = resource.kind?.toLowerCase() || "unknown";
      const isSelected = Array.from(selectedResources).some(
        (item) => item.resource.name === resource.name && item.resourceType === resourceType
      );
      return (
        <ResourceItem
          key={`${resource.name}-${index}`}
          resource={resource}
          resourceType={resourceType}
          onToggle={handleToggleResource}
          disabled={!selectedProject}
          checked={isSelected}
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-2 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold">Add Existing Resources</h2>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <div className="border-b border-border p-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="devboxes">Devboxes</TabsTrigger>
              <TabsTrigger value="clusters">Databases</TabsTrigger>
              <TabsTrigger value="launchpads">Apps</TabsTrigger>
            </TabsList>
          </div>
          <div className="h-64 overflow-y-auto px-2">
            <TabsContent value="devboxes" className="mt-0">
              {renderResourceList(devboxes, "devboxes", devboxesLoading)}
            </TabsContent>
            <TabsContent value="clusters" className="mt-0">
              {renderResourceList(clusters, "clusters", clustersLoading)}
            </TabsContent>
            <TabsContent value="launchpads" className="mt-0">
              {renderResourceList(launchpads, "launchpads", launchpadsLoading)}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="border-t border-border p-2 bg-muted/30 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedResources.size
            ? `Selected Resources: ${selectedResources.size}`
            : "No resources selected"}
        </div>
        <div className="flex items-center gap-2">
          {selectedResources.size > 0 && (
            <Button
              onClick={() => setSelectedResources(new Set())}
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
          )}
          <Button
            onClick={handleAddToProject}
            disabled={!selectedProject || !selectedResources.size}
            size="sm"
            variant="outline"
          >
            Add to Project
          </Button>
        </div>
      </div>
    </div>
  );
}
