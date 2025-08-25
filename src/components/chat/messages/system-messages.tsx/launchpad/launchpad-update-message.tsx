"use client";

/**
 * LaunchpadUpdateMessage Component
 *
 * A flexible component for updating launchpad configurations including image, resources, ports, and environment variables.
 *
 * Usage Examples:
 *
 * 1. Update existing launchpad with target:
 * <LaunchpadUpdateMessage
 *   payload={{
 *     target: { type: "builtin", resourceType: "deployment", name: "my-app", namespace: "default" },
 *     resource: { cpu: 2000, memory: 4096, replicas: 3 },
 *     image: "nginx:latest",
 *     ports: [{ port: 8080, protocol: "TCP", exposesPublicDomain: true }],
 *     env: [{ name: "NODE_ENV", value: "production" }],
 *     launchpadName: "my-app",
 *     status: "Running"
 *   }}
 * />
 *
 * 2. Create new configuration (no target):
 * <LaunchpadUpdateMessage
 *   payload={{
 *     resource: { cpu: 1000, memory: 2048, replicas: 1 },
 *     image: "node:18",
 *     ports: [{ port: 3000, protocol: "TCP", exposesPublicDomain: true }],
 *     env: [{ name: "PORT", value: "3000" }],
 *     launchpadName: "New App"
 *   }}
 * />
 *
 * 3. Update with streaming parameters:
 * <LaunchpadUpdateMessage
 *   payload={{
 *     target: target,
 *     resource: { cpu: 4000, memory: 8192, replicas: 5 },
 *     image: "my-app:v2.0",
 *     ports: [],
 *     env: [],
 *     launchpadName: "High-Performance App",
 *     status: "Running"
 *   }}
 * />
 *
 * 4. Integration with Copilot Actions:
 *
 * export const updateLaunchpadAction = (context: SealosApiContext) => {
 *   useCopilotAction({
 *     name: "updateLaunchpad",
 *     description: "Update launchpad configuration with new resources, image, ports, and environment variables",
 *     parameters: [
 *       {
 *         name: "target",
 *         type: "object",
 *         required: true,
 *         description: "Launchpad target configuration",
 *       },
 *       {
 *         name: "cpu",
 *         type: "number",
 *         required: false,
 *         description: "CPU allocation in millicores",
 *       },
 *       {
 *         name: "memory",
 *         type: "number",
 *         required: false,
 *         description: "Memory allocation in MB",
 *       },
 *       {
 *         name: "replicas",
 *         type: "number",
 *         required: false,
 *         description: "Number of replicas",
 *       },
 *       {
 *         name: "image",
 *         type: "string",
 *         required: false,
 *         description: "Docker image to use",
 *       },
 *       {
 *         name: "ports",
 *         type: "array",
 *         required: false,
 *         description: "Array of port configurations",
 *       },
 *       {
 *         name: "env",
 *         type: "array",
 *         required: false,
 *         description: "Array of environment variables",
 *       },
 *     ],
 *     handler: ({ target, cpu, memory, replicas, image, ports, env }) => {
 *       return (
 *         <LaunchpadUpdateMessage
 *           payload={{
 *             target,
 *             resource: {
 *               cpu: cpu || 2000,
 *               memory: memory || 4096,
 *               replicas: replicas || 1
 *             },
 *             image: image || "nginx:latest",
 *             ports: ports || [],
 *             env: env || [],
 *             launchpadName: target.name,
 *             status: "Running"
 *           }}
 *         />
 *       );
 *     },
 *   });
 * };
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle,
  Settings,
  Cpu,
  HardDrive,
  Network,
  Plus,
  X,
  Image as ImageIcon,
  Database,
  ChevronDown,
} from "lucide-react";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { LaunchpadPatchRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";
import BaseSystemMessage from "../components/base-system-message";

interface LaunchpadResource {
  cpu: number;
  memory: number;
  replicas: number;
}

interface LaunchpadPort {
  port: number;
  protocol: "TCP" | "UDP" | "SCTP";
  appProtocol?: "HTTP" | "GRPC" | "WS";
  exposesPublicDomain: boolean;
}

interface LaunchpadEnv {
  name: string;
  value?: string;
  valueFrom?: {
    secretKeyRef: {
      key: string;
      name: string;
    };
  };
}

interface LaunchpadUpdateMessageProps {
  target: BuiltinResourceTarget;
  payload?: {
    target?: BuiltinResourceTarget;
    resource?: LaunchpadResource;
    image?: string;
    ports?: LaunchpadPort[];
    env?: LaunchpadEnv[];
    launchpadName?: string;
    status?: string;
  };
}

export default function LaunchpadUpdateMessage({
  target,
  payload,
}: LaunchpadUpdateMessageProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { launchpad } = useTRPCClients();
  const launchpadName = payload?.launchpadName || target?.name || "Launchpad";
  const status = payload?.status || "Unknown";

  const updateMutation = useMutation(
    launchpad.updateLaunchpad.mutationOptions()
  );

  // Define default values, merging with payload
  const defaultValues = {
    cpu: payload?.resource?.cpu || 2000,
    memory: payload?.resource?.memory || 4096,
    replicas: payload?.resource?.replicas || 1,
    image: payload?.image || "nginx:latest",
    ports: payload?.ports || [],
    env: payload?.env || [],
  };

  // Initialize state with default values
  const [cpu, setCpu] = useState<number>(defaultValues.cpu);
  const [memory, setMemory] = useState<number>(defaultValues.memory);
  const [replicas, setReplicas] = useState<number>(defaultValues.replicas);
  const [image, setImage] = useState<string>(defaultValues.image);
  const [ports, setPorts] = useState<LaunchpadPort[]>(defaultValues.ports);
  const [env, setEnv] = useState<LaunchpadEnv[]>(defaultValues.env);

  // Reset state when payload changes
  useEffect(() => {
    setCpu(defaultValues.cpu);
    setMemory(defaultValues.memory);
    setReplicas(defaultValues.replicas);
    setImage(defaultValues.image);
    setPorts(defaultValues.ports);
    setEnv(defaultValues.env);
  }, [payload]);

  const handleAddPort = () => {
    const newPort: LaunchpadPort = {
      port: 8080,
      protocol: "TCP",
      exposesPublicDomain: true,
    };
    setPorts([...ports, newPort]);
  };

  const handleRemovePort = (index: number) => {
    setPorts(ports.filter((_, i) => i !== index));
  };

  const handleUpdatePort = (
    index: number,
    field: keyof LaunchpadPort,
    value: any
  ) => {
    const updatedPorts = [...ports];
    updatedPorts[index] = { ...updatedPorts[index], [field]: value };
    setPorts(updatedPorts);
  };

  const handleAddEnv = () => {
    const newEnv: LaunchpadEnv = {
      name: `ENV_${env.length + 1}`,
      value: "",
    };
    setEnv([...env, newEnv]);
  };

  const handleRemoveEnv = (index: number) => {
    setEnv(env.filter((_, i) => i !== index));
  };

  const handleUpdateEnv = (
    index: number,
    field: keyof LaunchpadEnv,
    value: any
  ) => {
    const updatedEnv = [...env];
    updatedEnv[index] = { ...updatedEnv[index], [field]: value };
    setEnv(updatedEnv);
  };

  const handleUpdate = async () => {
    if (!target) {
      toast.error("No target specified for update");
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare the patch request
      const patchRequest: LaunchpadPatchRequest = {};

      // Update resources
      if (
        cpu !== payload?.resource?.cpu ||
        memory !== payload?.resource?.memory ||
        replicas !== payload?.resource?.replicas
      ) {
        patchRequest.resource = {
          cpu,
          memory,
          replicas,
        };
      }

      // Update image
      if (image !== payload?.image) {
        patchRequest.image = image;
      }

      // Update environment variables
      if (
        env.length > 0 &&
        JSON.stringify(env) !== JSON.stringify(payload?.env)
      ) {
        patchRequest.env = env;
      }

      await updateMutation.mutateAsync({
        name: target.name || "",
        request: patchRequest,
      });

      setIsCompleted(true);
      toast.success("Launchpad updated successfully!");
    } catch (error) {
      console.error("Failed to update launchpad:", error);
      toast.error("Failed to update launchpad");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCompleted) {
    return (
      <BaseSystemMessage target={target}>
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-medium text-green-900 dark:text-green-100">
              {launchpadName} Updated Successfully
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">
              CPU: {cpu}m • Memory: {memory}MB • Replicas: {replicas} • Ports:{" "}
              {ports.length} • Env: {env.length}
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Your launchpad configuration has been updated successfully.</p>
        </div>
      </BaseSystemMessage>
    );
  }

  return (
    <BaseSystemMessage target={target}>
      {/* Image Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          <Label className="text-sm font-medium">Container Image</Label>
        </div>
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="nginx:latest"
          className="w-full"
        />
      </div>

      <Separator />

      {/* Resources Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          <Label className="text-sm font-medium">Resources</Label>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">CPU (m)</Label>
            <Select
              value={cpu.toString()}
              onValueChange={(value) => setCpu(Number(value))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[500, 1000, 2000, 4000, 6000, 8000].map((cpuValue) => (
                  <SelectItem key={cpuValue} value={cpuValue.toString()}>
                    {cpuValue}m
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Memory (MB)</Label>
            <Select
              value={memory.toString()}
              onValueChange={(value) => setMemory(Number(value))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[512, 1024, 2048, 4096, 8192, 16000].map((memoryValue) => (
                  <SelectItem key={memoryValue} value={memoryValue.toString()}>
                    {memoryValue}MB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Replicas</Label>
            <Select
              value={replicas.toString()}
              onValueChange={(value) => setReplicas(Number(value))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 10].map((replicaValue) => (
                  <SelectItem
                    key={replicaValue}
                    value={replicaValue.toString()}
                  >
                    {replicaValue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Collapsible Sections */}
      <Accordion type="multiple" className="w-full space-y-1">
        {/* Ports Section */}
        <AccordionItem
          value="ports"
          className="inset-ring inset-ring-border rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4" />
              <Network className="h-4 w-4" />
              <span className="font-medium">Ports ({ports.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-3">
              {ports.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No ports configured
                </div>
              ) : (
                ports.map((port, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs">Port</Label>
                        <Input
                          type="number"
                          value={port.port}
                          onChange={(e) =>
                            handleUpdatePort(
                              index,
                              "port",
                              parseInt(e.target.value)
                            )
                          }
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Protocol</Label>
                        <Select
                          value={port.protocol}
                          onValueChange={(value) =>
                            handleUpdatePort(
                              index,
                              "protocol",
                              value as "TCP" | "UDP" | "SCTP"
                            )
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TCP">TCP</SelectItem>
                            <SelectItem value="UDP">UDP</SelectItem>
                            <SelectItem value="SCTP">SCTP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">App Protocol</Label>
                        <Select
                          value={port.appProtocol || ""}
                          onValueChange={(value) =>
                            handleUpdatePort(
                              index,
                              "appProtocol",
                              value || undefined
                            )
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            <SelectItem value="HTTP">HTTP</SelectItem>
                            <SelectItem value="GRPC">GRPC</SelectItem>
                            <SelectItem value="WS">WS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={port.exposesPublicDomain}
                          onCheckedChange={(checked) =>
                            handleUpdatePort(
                              index,
                              "exposesPublicDomain",
                              checked
                            )
                          }
                        />
                        <Label className="text-xs">Public Domain</Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePort(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                onClick={handleAddPort}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Port
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Environment Variables Section */}
        <AccordionItem
          value="env"
          className="inset-ring inset-ring-border rounded-lg"
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              <ChevronDown className="h-4 w-4" />
              <Database className="h-4 w-4" />
              <span className="font-medium">
                Environment Variables ({env.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-4">
            <div className="space-y-3">
              {env.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No environment variables configured
                </div>
              ) : (
                env.map((envVar, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={envVar.name}
                          onChange={(e) =>
                            handleUpdateEnv(index, "name", e.target.value)
                          }
                          placeholder="VARIABLE_NAME"
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Value</Label>
                        <Input
                          value={envVar.value || ""}
                          onChange={(e) =>
                            handleUpdateEnv(index, "value", e.target.value)
                          }
                          placeholder="variable_value"
                          className="h-8"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEnv(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                onClick={handleAddEnv}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Environment Variable
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Update Button */}
      <Button
        onClick={handleUpdate}
        disabled={isUpdating || !target}
        className="w-full"
      >
        {isUpdating
          ? "Updating..."
          : target
          ? "Update Launchpad"
          : "No Target Specified"}
      </Button>

      {!target && (
        <div className="text-sm text-muted-foreground text-center">
          <p>Target is required to update launchpad configuration.</p>
        </div>
      )}
    </BaseSystemMessage>
  );
}
