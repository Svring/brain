"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { nanoid } from "@/lib/utils";
import { SimplePortList } from "@/components/chat/state-cards/project-proposal/components/simple-port-list";
import { DEVBOX_RUNTIME_ICONS } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";
import type {
  DevBox,
  Database,
  App,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useProjectState } from "@/contexts/project/project-context";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { CLUSTER_CONSTANT_TYPE_VERSION } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-versions";

interface AddNewResourcesProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export function AddNewResources({ onBack, onSuccess }: AddNewResourcesProps) {
  // Resource dialog states
  const [devboxDialogOpen, setDevboxDialogOpen] = useState(false);
  const [databaseDialogOpen, setDatabaseDialogOpen] = useState(false);
  const [appDialogOpen, setAppDialogOpen] = useState(false);

  // Resource form data
  const [devboxData, setDevboxData] = useState<Partial<DevBox>>({
    name: "",
    runtime: "next.js",
    ports: [],
  });
  const [databaseData, setDatabaseData] = useState<Partial<Database>>({
    name: "",
    type: "postgresql",
  });
  const [appData, setAppData] = useState<Partial<App>>({
    name: "",
    image: "",
    ports: [],
  });

  // State for resources to be created
  const [resourcesToCreate, setResourcesToCreate] = useState<{
    devboxes: DevBox[];
    databases: Database[];
    apps: App[];
  }>({
    devboxes: [],
    databases: [],
    apps: [],
  });

  // Hooks for resource creation
  const { devbox, cluster, launchpad, project } = useTRPCClients();
  const { selectedProject } = useProjectState();
  const { invalidateQueries } = useInvalidateQueries();

  // Create mutations
  const createDevboxMutation = useMutation(devbox.create.mutationOptions());
  const createClusterMutation = useMutation(cluster.create.mutationOptions());
  const createLaunchpadMutation = useMutation(
    launchpad.create.mutationOptions()
  );
  const addToProjectMutation = useMutation(
    project.addResources.mutationOptions()
  );

  const [isCreating, setIsCreating] = useState(false);

  const handleCancel = () => {
    setResourcesToCreate({
      devboxes: [],
      databases: [],
      apps: [],
    });
    onBack();
  };

  const handleAdd = async () => {
    if (isCreating) return;

    try {
      setIsCreating(true);

      if (!selectedProject) {
        toast.error("No project selected. Please select a project first.");
        return;
      }

      // Create all resources first
      const resourcePromises: Promise<any>[] = [];
      const resourceTargets: any[] = [];

      // Create DevBoxes
      for (const devbox of resourcesToCreate.devboxes) {
        const devboxDataParsed = {
          name: devbox.name,
          runtime: devbox.runtime,
          ports:
            devbox.ports?.map((p: any) => ({
              number: p.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: true,
            })) || [],
          resource: {
            cpu: 1,
            memory: 1,
          },
        };

        resourcePromises.push(
          createDevboxMutation
            .mutateAsync(devboxDataParsed)
            .then((result) => {
              const target = convertResourceTypeToTarget(
                "devbox",
                devboxDataParsed.name
              );
              resourceTargets.push(target);
              return { type: "devbox", result, success: true };
            })
            .catch((error) => {
              throw error;
            })
        );
      }

      // Create Databases
      for (const database of resourcesToCreate.databases) {
        const databaseType =
          database.type as keyof typeof CLUSTER_CONSTANT_TYPE_VERSION;
        const version =
          CLUSTER_CONSTANT_TYPE_VERSION[databaseType]?.[0] ||
          "postgresql-14.8.0";

        const clusterData = {
          name: database.name,
          type: database.type,
          version: version,
          terminationPolicy: "Delete" as const,
          resource: {
            storage: 10,
            cpu: 1,
            memory: 1,
            replicas: 1,
          },
        };

        resourcePromises.push(
          createClusterMutation
            .mutateAsync(clusterData)
            .then((result) => {
              const target = convertResourceTypeToTarget(
                "cluster",
                clusterData.name
              );
              resourceTargets.push(target);
              return { type: "cluster", result, success: true };
            })
            .catch((error) => {
              throw error;
            })
        );
      }

      // Create Apps
      for (const app of resourcesToCreate.apps) {
        const launchpadData = {
          name: app.name,
          image: { imageName: app.image },
          ports:
            app.ports?.map((p: any) => ({
              number: p.number,
              protocol: "HTTP" as const,
              exposesPublicDomain: true,
            })) || [],
          env: [],
          resource: {
            replicas: 1,
            cpu: 1,
            memory: 1,
          },
        };

        resourcePromises.push(
          createLaunchpadMutation
            .mutateAsync(launchpadData)
            .then((result) => {
              const target = convertResourceTypeToTarget(
                "deployment",
                launchpadData.name
              );
              resourceTargets.push(target);
              return { type: "launchpad", result, success: true };
            })
            .catch((error) => {
              throw error;
            })
        );
      }

      // Wait for all resources to be created
      if (resourcePromises.length === 0) {
        toast.error("Please add at least one resource");
        return;
      }

      const resourceResults = await Promise.allSettled(resourcePromises);

      // Collect successful resources
      const successfulResources = resourceResults
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      const failedResources = resourceResults
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected"
        )
        .map((result) => result.reason);

      if (successfulResources.length === 0) {
        toast.error("No resources were created successfully");
        return;
      }

      // Add all successful resources to the project in one batch
      await addToProjectMutation.mutateAsync({
        resources: resourceTargets,
        name: selectedProject,
      });

      // Invalidate queries to refresh the UI
      invalidateQueries([project.getResources.queryKey()], true);

      if (failedResources.length > 0) {
        toast.error(
          `Created ${successfulResources.length} resource(s) but ${failedResources.length} failed`
        );
      } else {
        toast.success(
          `Successfully added ${successfulResources.length} resource(s) to project`
        );
      }

      onSuccess?.();
      onBack();
    } catch (error: any) {
      toast.error(error.message || "Failed to create resources");
      console.error("Error creating resources:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Resource creation handlers - add to list
  const handleAddDevbox = () => {
    if (devboxData.name?.trim()) {
      const newDevbox: DevBox = {
        name: devboxData.name.trim(),
        runtime: devboxData.runtime || "next.js",
        ports: devboxData.ports || [],
      };
      setResourcesToCreate((prev) => ({
        ...prev,
        devboxes: [...prev.devboxes, newDevbox],
      }));
      setDevboxDialogOpen(false);
      setDevboxData({ name: "", runtime: "next.js", ports: [] });
    }
  };

  const handleAddDatabase = () => {
    if (databaseData.name?.trim()) {
      const newDatabase: Database = {
        name: databaseData.name.trim(),
        type: databaseData.type || "postgresql",
      };
      setResourcesToCreate((prev) => ({
        ...prev,
        databases: [...prev.databases, newDatabase],
      }));
      setDatabaseDialogOpen(false);
      setDatabaseData({ name: "", type: "postgresql" });
    }
  };

  const handleAddApp = () => {
    if (appData.name?.trim() && appData.image?.trim()) {
      const newApp: App = {
        name: appData.name.trim(),
        image: appData.image.trim(),
        ports: appData.ports || [],
      };
      setResourcesToCreate((prev) => ({
        ...prev,
        apps: [...prev.apps, newApp],
      }));
      setAppDialogOpen(false);
      setAppData({ name: "", image: "", ports: [] });
    }
  };

  // Delete resource functions
  const handleDeleteDevbox = (index: number) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      devboxes: prev.devboxes.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteDatabase = (index: number) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      databases: prev.databases.filter((_, i) => i !== index),
    }));
  };

  const handleDeleteApp = (index: number) => {
    setResourcesToCreate((prev) => ({
      ...prev,
      apps: prev.apps.filter((_, i) => i !== index),
    }));
  };

  // Sanitize name for DNS compliance
  const sanitizeName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  };

  // Generate default names
  const generateDefaultName = (type: "devbox" | "database" | "app") => {
    const id = nanoid();
    return sanitizeName(`${type}-${id}`);
  };

  // Dialog open handlers with default names
  const handleOpenDevboxDialog = () => {
    setDevboxData({
      name: generateDefaultName("devbox"),
      runtime: "next.js",
      ports: [],
    });
    setDevboxDialogOpen(true);
  };

  const handleOpenDatabaseDialog = () => {
    setDatabaseData({
      name: generateDefaultName("database"),
      type: "postgresql",
    });
    setDatabaseDialogOpen(true);
  };

  const handleOpenAppDialog = () => {
    setAppData({
      name: generateDefaultName("app"),
      image: "",
      ports: [],
    });
    setAppDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header with Back Button */}
        <div className="border-b border-border p-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-semibold">Add New Resources</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Three Resource Sections */}
          <div className="space-y-4">
            {/* Devbox Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Devbox</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={handleOpenDevboxDialog}
                  disabled={isCreating}
                >
                  <Plus size={12} />
                </Button>
              </div>
              {resourcesToCreate.devboxes.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No resources yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {resourcesToCreate.devboxes.map((devbox, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-muted/20 rounded border"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-white/80 rounded">
                        <Image
                          src={
                            DEVBOX_RUNTIME_ICONS[
                              devbox.runtime as keyof typeof DEVBOX_RUNTIME_ICONS
                            ] || "https://devbox.bja.sealos.run/logo.svg"
                          }
                          alt={`${devbox.runtime} Icon`}
                          width={20}
                          height={20}
                          className="rounded"
                          priority
                        />
                      </div>
                      <span className="text-sm font-medium ml-2 truncate flex-1">
                        {devbox.runtime}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                        onClick={() => handleDeleteDevbox(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Database Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Database</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={handleOpenDatabaseDialog}
                  disabled={isCreating}
                >
                  <Plus size={12} />
                </Button>
              </div>
              {resourcesToCreate.databases.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No resources yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {resourcesToCreate.databases.map((database, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-muted/20 rounded border"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-white/80 rounded">
                        <Image
                          src={
                            CLUSTER_TYPE_ICON_MAP[
                              database.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                            ] || "https://dbprovider.bja.sealos.run/logo.svg"
                          }
                          alt={`${database.type} Icon`}
                          width={20}
                          height={20}
                          className="rounded"
                          priority
                        />
                      </div>
                      <span className="text-sm font-medium ml-2 truncate flex-1">
                        {database.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                        onClick={() => handleDeleteDatabase(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* App Launchpad Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">App Launchpad</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={handleOpenAppDialog}
                  disabled={isCreating}
                >
                  <Plus size={12} />
                </Button>
              </div>
              {resourcesToCreate.apps.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No resources yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {resourcesToCreate.apps.map((app, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-muted/20 rounded border"
                    >
                      <span className="text-sm font-medium ml-2 truncate flex-1">
                        {app.image}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                        onClick={() => handleDeleteApp(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="p-4 pt-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? "Adding..." : "Add All"}
            </Button>
          </div>
        </div>
      </div>

      {/* Devbox Configuration Dialog */}
      <Dialog open={devboxDialogOpen} onOpenChange={setDevboxDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Devbox</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Name</Label>
              <Input
                value={devboxData.name || ""}
                onChange={(e) =>
                  setDevboxData({ ...devboxData, name: e.target.value })
                }
                placeholder="Devbox name"
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Runtime</Label>
              <div className="grid grid-cols-5 gap-2">
                {DEVBOX_RUNTIMES.map((runtime) => (
                  <div
                    key={runtime}
                    onClick={() =>
                      setDevboxData({ ...devboxData, runtime: runtime as any })
                    }
                    className={`
                    flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all
                    hover:bg-muted/50 hover:border-primary/50
                    ${
                      (devboxData.runtime || "next.js") === runtime
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }
                  `}
                  >
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-white/80 rounded">
                      <Image
                        src={
                          DEVBOX_RUNTIME_ICONS[runtime] ||
                          "https://devbox.bja.sealos.run/logo.svg"
                        }
                        alt={`${runtime} Icon`}
                        width={24}
                        height={24}
                        className="rounded"
                        priority
                      />
                    </div>
                    <span className="text-sm font-medium leading-tight truncate">
                      {runtime}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SimplePortList
                ports={(devboxData.ports || []).map((p: any) => p.number)}
                allowEditing={true}
                onPortsChange={(portNumbers) =>
                  setDevboxData({
                    ...devboxData,
                    ports: portNumbers.map((num) => ({
                      number: num,
                      publicAccess: true,
                    })),
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDevboxDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDevbox}
              disabled={!devboxData.name?.trim()}
              className="flex-1"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Database Configuration Dialog */}
      <Dialog open={databaseDialogOpen} onOpenChange={setDatabaseDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Database</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Name</Label>
              <Input
                value={databaseData.name || ""}
                onChange={(e) =>
                  setDatabaseData({ ...databaseData, name: e.target.value })
                }
                placeholder="Database name"
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {CLUSTER_TYPES.map((type) => (
                  <div
                    key={type}
                    onClick={() =>
                      setDatabaseData({ ...databaseData, type: type as any })
                    }
                    className={`
                    flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all
                    hover:bg-muted/50 hover:border-primary/50
                    ${
                      databaseData.type === type
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/30"
                    }
                  `}
                  >
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-white/80 rounded">
                      <Image
                        src={
                          CLUSTER_TYPE_ICON_MAP[
                            type as keyof typeof CLUSTER_TYPE_ICON_MAP
                          ] || "https://dbprovider.bja.sealos.run/logo.svg"
                        }
                        alt={`${type} Icon`}
                        width={24}
                        height={24}
                        className="rounded"
                        priority
                      />
                    </div>
                    <span className="text-sm font-medium leading-tight truncate">
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDatabaseDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDatabase}
              disabled={!databaseData.name?.trim()}
              className="flex-1"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* App Configuration Dialog */}
      <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add App</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Name</Label>
              <Input
                value={appData.name || ""}
                onChange={(e) =>
                  setAppData({ ...appData, name: e.target.value })
                }
                placeholder="App name"
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Image</Label>
              <Input
                value={appData.image || ""}
                onChange={(e) =>
                  setAppData({ ...appData, image: e.target.value })
                }
                placeholder="Enter image URL (e.g., nginx:latest)"
                className="w-full"
              />
            </div>

            <div>
              <SimplePortList
                ports={(appData.ports || []).map((p: any) => p.number)}
                allowEditing={true}
                onPortsChange={(portNumbers) =>
                  setAppData({
                    ...appData,
                    ports: portNumbers.map((num) => ({
                      number: num,
                      publicAccess: true,
                    })),
                  })
                }
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setAppDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddApp}
              disabled={!appData.name?.trim() || !appData.image?.trim()}
              className="flex-1"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
