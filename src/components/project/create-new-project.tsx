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
import { Plus, X } from "lucide-react";
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
import { useProjectCreate } from "@/hooks/brain/use-project-create";

interface CreateNewProjectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (projectName: string) => void;
}

export function CreateNewProject({
  open,
  onOpenChange,
  onConfirm,
}: CreateNewProjectProps) {
  const [projectName, setProjectName] = useState(`project-${nanoid()}`);
  const { createProjectFromSimpleData, isCreating } = useProjectCreate({
    onSuccess: (createdProjectName: string) => {
      onConfirm(createdProjectName);
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error("Project creation failed:", error);
    },
  });

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

  // State for created resources
  const [createdDevboxes, setCreatedDevboxes] = useState<DevBox[]>([]);
  const [createdDatabases, setCreatedDatabases] = useState<Database[]>([]);
  const [createdApps, setCreatedApps] = useState<App[]>([]);

  const handleConfirm = async () => {
    if (isCreating) return;

    try {
      // Use project name from input (already has default value)
      const sanitizedProjectName = sanitizeName(projectName.trim());

      // Prepare the simple deployment data with sanitized names
      const deploymentData = {
        devbox:
          createdDevboxes.length > 0
            ? {
                name: sanitizeName(createdDevboxes[0].name),
                runtime: createdDevboxes[0].runtime,
                ports:
                  createdDevboxes[0].ports?.map((p: any) => p.number) || [],
              }
            : undefined,
        database:
          createdDatabases.length > 0
            ? {
                name: sanitizeName(createdDatabases[0].name),
                type: createdDatabases[0].type,
              }
            : undefined,
        app:
          createdApps.length > 0
            ? {
                name: sanitizeName(createdApps[0].name),
                image: createdApps[0].image,
                ports: createdApps[0].ports?.map((p: any) => p.number) || [],
              }
            : undefined,
      };

      // Create the project with resources
      await createProjectFromSimpleData(deploymentData, sanitizedProjectName);

      // Reset form
      setProjectName(`project-${nanoid()}`);
      setCreatedDevboxes([]);
      setCreatedDatabases([]);
      setCreatedApps([]);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleCancel = () => {
    setProjectName(`project-${nanoid()}`);
    setCreatedDevboxes([]);
    setCreatedDatabases([]);
    setCreatedApps([]);
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Resource creation handlers
  const handleAddDevbox = () => {
    if (devboxData.name?.trim()) {
      const newDevbox: DevBox = {
        name: devboxData.name.trim(),
        runtime: devboxData.runtime || "next.js",
        ports: devboxData.ports || [],
      };
      setCreatedDevboxes([...createdDevboxes, newDevbox]);
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
      setCreatedDatabases([...createdDatabases, newDatabase]);
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
      setCreatedApps([...createdApps, newApp]);
      setAppDialogOpen(false);
      setAppData({ name: "", image: "", ports: [] });
    }
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

  // Generate default project name
  const generateDefaultProjectName = () => {
    const id = nanoid();
    return `project-${id}`;
  };

  // Delete resource functions
  const handleDeleteDevbox = (index: number) => {
    setCreatedDevboxes(createdDevboxes.filter((_, i) => i !== index));
  };

  const handleDeleteDatabase = (index: number) => {
    setCreatedDatabases(createdDatabases.filter((_, i) => i !== index));
  };

  const handleDeleteApp = (index: number) => {
    setCreatedApps(createdApps.filter((_, i) => i !== index));
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>

          {/* Project Name Input */}
          <div className="pt-4">
            <div className="flex items-center gap-4">
              <Label
                htmlFor="project-name"
                className="text-right whitespace-nowrap"
              >
                Name
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter project name"
                className="flex-1"
                autoFocus
              />
            </div>
          </div>

          {/* Three Sections */}
          <div className="space-y-2">
            {/* Devbox Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Devbox</Label>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 p-0"
                  onClick={handleOpenDevboxDialog}
                >
                  <Plus size={12} />
                </Button>
              </div>
              {createdDevboxes.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No resources yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {createdDevboxes.map((devbox, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-muted/20 rounded border"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
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
                >
                  <Plus size={12} />
                </Button>
              </div>
              {createdDatabases.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No resources yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {createdDatabases.map((database, index) => (
                    <div
                      key={index}
                      className="flex items-center p-2 bg-muted/20 rounded border"
                    >
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
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
                >
                  <Plus size={12} />
                </Button>
              </div>
              {createdApps.length === 0 ? (
                <div className="text-sm text-muted-foreground py-2">
                  No resources yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {createdApps.map((app, index) => (
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

          {/* Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
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
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
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
