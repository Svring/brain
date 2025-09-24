"use client";

import { useState, useEffect } from "react";
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
import { SimplePortList } from "@/components/chat/state-cards/project-proposal/components/simple-port-list";
import { DEVBOX_RUNTIME_ICONS } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import type { DevBox } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { generateDefaultName } from "./resource-utils";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";

interface DevboxTemplate {
  runtime: string;
  config: {
    appPorts: Array<{
      name: string;
      port: number;
      protocol: string;
    }>;
    ports: Array<{
      containerPort: number;
      name: string;
      protocol: string;
    }>;
    releaseArgs: string[];
    releaseCommand: string[];
    user: string;
    workingDir: string;
  };
}

interface DevboxResourceProps {
  devboxes: DevBox[];
  onAddDevbox: (devbox: DevBox) => void;
  onDeleteDevbox: (index: number) => void;
  isCreating: boolean;
}

export function DevboxResource({
  devboxes,
  onAddDevbox,
  onDeleteDevbox,
  isCreating,
}: DevboxResourceProps) {
  const { devbox } = useTRPCClients();
  
  // Fetch devbox templates
  const { data: templates } = useQuery(devbox.templates.queryOptions());

  console.log("templates", templates);
  
  const [devboxDialogOpen, setDevboxDialogOpen] = useState(false);
  const [devboxData, setDevboxData] = useState<Partial<DevBox>>({
    name: "",
    runtime: "next.js",
    ports: [],
  });


  const handleAddDevbox = () => {
    if (devboxData.name?.trim()) {
      const newDevbox: DevBox = {
        name: devboxData.name.trim(),
        runtime: devboxData.runtime || "next.js",
        ports: devboxData.ports || [],
      };
      onAddDevbox(newDevbox);
      setDevboxDialogOpen(false);
      setDevboxData({ name: "", runtime: "next.js", ports: [] });
    }
  };

  // Update ports when runtime changes or when templates load
  useEffect(() => {
    if (templates && Array.isArray(templates) && devboxData.runtime) {
      const template = templates.find((t: DevboxTemplate) => t.runtime === devboxData.runtime);
      
      console.log("Runtime changed to:", devboxData.runtime);
      console.log("Found template:", template);
      
      if (template && template.config.appPorts) {
        const templatePorts = template.config.appPorts.map((appPort: { port: number }) => ({
          number: appPort.port,
          publicAccess: true,
        }));

        console.log("Setting template ports:", templatePorts);

        setDevboxData(prev => ({
          ...prev,
          ports: templatePorts,
        }));
      }
    }
  }, [devboxData.runtime, templates]);

  // Update ports when dialog opens and templates are available
  useEffect(() => {
    if (devboxDialogOpen && templates && Array.isArray(templates) && devboxData.runtime) {
      const template = templates.find((t: DevboxTemplate) => t.runtime === devboxData.runtime);
      
      if (template && template.config.appPorts) {
        const templatePorts = template.config.appPorts.map((appPort: { port: number }) => ({
          number: appPort.port,
          publicAccess: true,
        }));

        console.log("Setting template ports on dialog open:", templatePorts);

        setDevboxData(prev => ({
          ...prev,
          ports: templatePorts,
        }));
      }
    }
  }, [devboxDialogOpen, templates, devboxData.runtime]);

  const handleOpenDevboxDialog = () => {
    const defaultRuntime = "next.js";
    setDevboxData({
      name: generateDefaultName("devbox"),
      runtime: defaultRuntime,
      ports: [],
    });
    setDevboxDialogOpen(true);
  };

  return (
    <>
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
        {devboxes.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {devboxes.map((devbox, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-muted/20 rounded border"
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
                  <img
                    src={
                      DEVBOX_RUNTIME_ICONS[
                        devbox.runtime as keyof typeof DEVBOX_RUNTIME_ICONS
                      ] || "https://devbox.bja.sealos.run/logo.svg"
                    }
                    alt={`${devbox.runtime} Icon`}
                    width={20}
                    height={20}
                    className="rounded"
                  />
                </div>
                <span className="text-sm font-medium ml-2 truncate flex-1">
                  {devbox.runtime}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground ml-1"
                  onClick={() => onDeleteDevbox(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
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
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
                      <img
                        src={
                          DEVBOX_RUNTIME_ICONS[runtime] ||
                          "https://devbox.bja.sealos.run/logo.svg"
                        }
                        alt={`${runtime} Icon`}
                        width={24}
                        height={24}
                        className="rounded"
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
    </>
  );
}
