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
import { Plus, X, Check } from "lucide-react";
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

  // Runtime selection state
  const [editingDevbox, setEditingDevbox] = useState<number | null>(null);
  const [runtimeDialogOpen, setRuntimeDialogOpen] = useState(false);
  const [selectedRuntime, setSelectedRuntime] = useState<string>("");


  // Inline editing handlers
  const handleAddDevboxInline = () => {
    const newDevbox: DevBox = {
      name: generateDefaultName("devbox"),
      runtime: "next.js",
      ports: [],
    };
    
    // Add template ports if available
    if (templates && Array.isArray(templates)) {
      const template = templates.find(
        (t: DevboxTemplate) => t.runtime === "next.js"
      );

      if (template && template.config.appPorts) {
        const templatePorts = template.config.appPorts.map(
          (appPort: { port: number }) => ({
            number: appPort.port,
            publicAccess: true,
          })
        );
        newDevbox.ports = templatePorts;
      }
    }
    
    onAddDevbox(newDevbox);
  };

  const handleSelectRuntime = (runtime: string) => {
    setSelectedRuntime(runtime);
    setRuntimeDialogOpen(false);
    if (editingDevbox !== null) {
      const updatedDevboxes = [...devboxes];
      updatedDevboxes[editingDevbox].runtime = runtime as any;
      
      // Update ports from template if available
      if (templates && Array.isArray(templates)) {
        const template = templates.find(
          (t: DevboxTemplate) => t.runtime === runtime
        );

        if (template && template.config.appPorts) {
          const templatePorts = template.config.appPorts.map(
            (appPort: { port: number }) => ({
              number: appPort.port,
              publicAccess: true,
            })
          );
          updatedDevboxes[editingDevbox].ports = templatePorts;
        }
      }
      
      // Update the devbox in parent component
      onDeleteDevbox(editingDevbox);
      onAddDevbox(updatedDevboxes[editingDevbox]);
      setEditingDevbox(null);
    }
  };


  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Devbox</Label>
        
        {/* Existing devboxes */}
        {devboxes.length > 0 && (
          <div className="space-y-2">
            {devboxes.map((devbox, index) => (
              <div
                key={index}
                className="flex items-center p-2 py-1 bg-muted/20 rounded border"
              >
                {/* Runtime button on the left */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-5 h-5 flex items-center justify-center bg-background-tertiary rounded">
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
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 text-sm"
                    onClick={() => {
                      setEditingDevbox(index);
                      setRuntimeDialogOpen(true);
                    }}
                    disabled={isCreating}
                  >
                    {devbox.runtime}
                  </Button>
                </div>
                
                {/* Ports in the middle */}
                <div className="flex-1 mx-2">
                  <SimplePortList
                    ports={devbox.ports?.map((p: any) => p.number) || []}
                    allowEditing={true}
                    onPortsChange={(portNumbers) => {
                      const updatedDevbox = {
                        ...devbox,
                        ports: portNumbers.map((num) => ({
                          number: num,
                          publicAccess: true,
                        })),
                      };
                      onDeleteDevbox(index);
                      onAddDevbox(updatedDevbox);
                    }}
                  />
                </div>
                
                {/* Delete button on the right */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onDeleteDevbox(index)}
                  disabled={isCreating}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new devbox */}
        <div
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
          onClick={handleAddDevboxInline}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Add new devbox
            </span>
          </div>
        </div>
      </div>

      {/* Runtime Selection Dialog */}
      <Dialog open={runtimeDialogOpen} onOpenChange={setRuntimeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Runtime</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-5 gap-2">
              {DEVBOX_RUNTIMES.map((runtime) => (
                <div
                  key={runtime}
                  onClick={() => handleSelectRuntime(runtime)}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all
                    hover:bg-muted/50 hover:border-primary/50
                    ${
                      selectedRuntime === runtime
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
        </DialogContent>
      </Dialog>
    </>
  );
}
