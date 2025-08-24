"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCreateLaunchpadMutation } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { generateDeployName } from "@/lib/sealos/resources/deployment/deploy-utils";
import { toast } from "sonner";
import { CheckCircle, Rocket, ChevronDown } from "lucide-react";

// Form schema with Zod validation
const launchpadFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be less than 50 characters"),
  image: z.string().min(1, "Image is required"),
  command: z.string().optional(),
  args: z.string().optional(),
  cpu: z
    .number()
    .min(500, "CPU must be at least 500m")
    .max(8000, "CPU must be at most 8000m"),
  memory: z
    .number()
    .min(512, "Memory must be at least 512Mi")
    .max(16000, "Memory must be at most 16000Mi"),
  replicas: z
    .number()
    .min(1, "Replicas must be at least 1")
    .max(10, "Replicas must be at most 10"),
  ports: z.string().optional(),
  portProtocol: z.enum(["TCP", "UDP", "SCTP"]),
  appProtocol: z.enum(["HTTP", "GRPC", "WS"]),
  exposesPublicDomain: z.boolean(),
  envVars: z.string().optional(),
  storageName: z.string().optional(),
  storagePath: z.string().optional(),
  storageSize: z.string().optional(),
  configMapPath: z.string().optional(),
  configMapValue: z.string().optional(),
});

type LaunchpadFormValues = z.infer<typeof launchpadFormSchema>;

interface DeploymentCreateMessageProps {
  payload?: {
    name?: string;
    image?: string;
    command?: string;
    args?: string;
    cpu?: number;
    memory?: number;
    replicas?: number;
    ports?: string;
    portProtocol?: "TCP" | "UDP" | "SCTP";
    appProtocol?: "HTTP" | "GRPC" | "WS";
    exposesPublicDomain?: boolean;
    envVars?: string;
    storageName?: string;
    storagePath?: string;
    storageSize?: string;
    configMapPath?: string;
    configMapValue?: string;
  };
}

export default function LaunchpadCreateMessage({
  payload,
}: DeploymentCreateMessageProps) {
  const [name, setName] = useState(payload?.name || generateDeployName());
  const [image, setImage] = useState(payload?.image || "nginx");
  const [command, setCommand] = useState(payload?.command || "");
  const [args, setArgs] = useState(payload?.args || "");
  const [cpu, setCpu] = useState<number>(payload?.cpu || 500);
  const [memory, setMemory] = useState<number>(payload?.memory || 512);
  const [replicas, setReplicas] = useState<number>(payload?.replicas || 1);
  const [ports, setPorts] = useState(payload?.ports || "80");
  const [portProtocol, setPortProtocol] = useState<"TCP" | "UDP" | "SCTP">(
    payload?.portProtocol || "TCP"
  );
  const [appProtocol, setAppProtocol] = useState<"HTTP" | "GRPC" | "WS">(
    payload?.appProtocol || "HTTP"
  );
  const [exposesPublicDomain, setExposesPublicDomain] = useState<boolean>(
    payload?.exposesPublicDomain ?? true
  );
  const [envVars, setEnvVars] = useState(payload?.envVars || "");
  const [storageName, setStorageName] = useState(payload?.storageName || "");
  const [storagePath, setStoragePath] = useState(payload?.storagePath || "");
  const [storageSize, setStorageSize] = useState(payload?.storageSize || "1Gi");
  const [configMapPath, setConfigMapPath] = useState(
    payload?.configMapPath || ""
  );
  const [configMapValue, setConfigMapValue] = useState(
    payload?.configMapValue || ""
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdDeploymentName, setCreatedDeploymentName] =
    useState<string>("");

  const context = createSealosContext();
  const createLaunchpadMutation = useCreateLaunchpadMutation(context);

  // Update state when payload changes (for streaming parameters)
  useEffect(() => {
    if (payload?.name !== undefined) {
      setName(payload.name);
    }
    if (payload?.image !== undefined) {
      setImage(payload.image);
    }
    if (payload?.command !== undefined) {
      setCommand(payload.command);
    }
    if (payload?.args !== undefined) {
      setArgs(payload.args);
    }
    if (payload?.cpu !== undefined) {
      setCpu(payload.cpu);
    }
    if (payload?.memory !== undefined) {
      setMemory(payload.memory);
    }
    if (payload?.replicas !== undefined) {
      setReplicas(payload.replicas);
    }
    if (payload?.ports !== undefined) {
      setPorts(payload.ports);
    }
    if (payload?.portProtocol !== undefined) {
      setPortProtocol(payload.portProtocol);
    }
    if (payload?.appProtocol !== undefined) {
      setAppProtocol(payload.appProtocol);
    }
    if (payload?.exposesPublicDomain !== undefined) {
      setExposesPublicDomain(payload.exposesPublicDomain);
    }
    if (payload?.envVars !== undefined) {
      setEnvVars(payload.envVars);
    }
    if (payload?.storageName !== undefined) {
      setStorageName(payload.storageName);
    }
    if (payload?.storagePath !== undefined) {
      setStoragePath(payload.storagePath);
    }
    if (payload?.storageSize !== undefined) {
      setStorageSize(payload.storageSize);
    }
    if (payload?.configMapPath !== undefined) {
      setConfigMapPath(payload.configMapPath);
    }
    if (payload?.configMapValue !== undefined) {
      setConfigMapValue(payload.configMapValue);
    }
  }, [payload]);

  const handleCreate = async () => {
    const deploymentName = name.trim() || generateDeployName();

    if (!image.trim()) {
      toast.error("Please enter an image");
      return;
    }

    setIsCreating(true);
    try {
      // Parse environment variables
      const envArray = envVars
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [key, ...valueParts] = line.split("=");
          return {
            name: key.trim(),
            value: valueParts.join("=").trim(),
          };
        });

      // Parse ports
      const portArray = ports
        .split(",")
        .map((port) => parseInt(port.trim()))
        .filter((port) => !isNaN(port))
        .map((port) => ({
          port,
          protocol: portProtocol,
          appProtocol,
          exposesPublicDomain,
        }));

      // Build storage array
      const storageArray =
        storageName && storagePath
          ? [
              {
                name: storageName,
                path: storagePath,
                size: storageSize,
              },
            ]
          : [];

      // Build configMap array
      const configMapArray = configMapPath
        ? [
            {
              path: configMapPath,
              value: configMapValue,
            },
          ]
        : [];

      await createLaunchpadMutation.mutateAsync({
        name: deploymentName,
        image: image.trim(),
        command: command.trim(),
        args: args.trim(),
        resource: {
          replicas,
          cpu,
          memory,
        },
        ports: portArray,
        env: envArray,
        hpa: null,
        imageRegistry: null,
        storage: storageArray,
        configMap: configMapArray,
      });

      // Set completion state
      setCreatedDeploymentName(deploymentName);
      setIsCompleted(true);
      toast.success("Deployment created successfully!");
    } catch (error) {
      console.error("Failed to create deployment:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="w-full bg-node-background border border-border-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Deployment Created Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Rocket className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {createdDeploymentName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Image: {image} • CPU: {cpu}m • Memory: {memory}Mi • Replicas:{" "}
                {replicas}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Your deployment is now ready to use. You can access it from the
              project dashboard.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-node-background border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Create Deployment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Configuration - Always Visible */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deployment-name">Application Name</Label>
            <Input
              id="deployment-name"
              placeholder="Enter application name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Container Image</Label>
            <Input
              id="image"
              placeholder="e.g., nginx:latest, node:18-alpine"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu">CPU (m)</Label>
              <Select
                value={cpu.toString()}
                onValueChange={(value) => setCpu(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select CPU" />
                </SelectTrigger>
                <SelectContent>
                  {[500, 1000, 2000, 4000, 6000, 8000].map((cpuValue) => (
                    <SelectItem key={cpuValue} value={cpuValue.toString()}>
                      {cpuValue}m ({cpuValue / 1000} cores)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory">Memory (Mi)</Label>
              <Select
                value={memory.toString()}
                onValueChange={(value) => setMemory(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Memory" />
                </SelectTrigger>
                <SelectContent>
                  {[512, 1024, 2048, 4096, 8192, 16000].map((memoryValue) => (
                    <SelectItem
                      key={memoryValue}
                      value={memoryValue.toString()}
                    >
                      {memoryValue}Mi ({memoryValue / 1024}GB)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replicas">Replicas</Label>
              <Input
                id="replicas"
                type="number"
                value={replicas}
                onChange={(e) => setReplicas(Number(e.target.value))}
                min="1"
                max="10"
                step="1"
              />
            </div>
          </div>
        </div>

        {/* Collapsible Sections */}
        <Accordion type="multiple" className="w-full">
          {/* Command & Arguments */}
          <AccordionItem value="command-args" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">Command & Arguments</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="command">Command (optional)</Label>
                <Input
                  id="command"
                  placeholder="e.g., npm start"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="args">Arguments (optional)</Label>
                <Input
                  id="args"
                  placeholder="e.g., --port 3000"
                  value={args}
                  onChange={(e) => setArgs(e.target.value)}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Ports & Protocol */}
          <AccordionItem value="ports-protocol" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">Ports & Protocol</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ports">Ports (comma-separated)</Label>
                <Input
                  id="ports"
                  placeholder="e.g., 80, 3000, 8080"
                  value={ports}
                  onChange={(e) => setPorts(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port-protocol">Protocol</Label>
                  <Select
                    value={portProtocol}
                    onValueChange={(value: "TCP" | "UDP" | "SCTP") =>
                      setPortProtocol(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TCP">TCP</SelectItem>
                      <SelectItem value="UDP">UDP</SelectItem>
                      <SelectItem value="SCTP">SCTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="app-protocol">App Protocol</Label>
                  <Select
                    value={appProtocol}
                    onValueChange={(value: "HTTP" | "GRPC" | "WS") =>
                      setAppProtocol(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HTTP">HTTP</SelectItem>
                      <SelectItem value="GRPC">GRPC</SelectItem>
                      <SelectItem value="WS">WS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="public-domain">Public Domain</Label>
                  <Select
                    value={exposesPublicDomain.toString()}
                    onValueChange={(value) =>
                      setExposesPublicDomain(value === "true")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Environment Variables, ConfigMap & Storage */}
          <AccordionItem value="env-storage" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <ChevronDown className="h-4 w-4" />
                <span className="font-medium">
                  Environment Variables, ConfigMap & Storage
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="env-vars">
                  Environment Variables (one per line, KEY=VALUE)
                </Label>
                <Textarea
                  id="env-vars"
                  placeholder="NODE_ENV=production&#10;DATABASE_URL=postgresql://..."
                  value={envVars}
                  onChange={(e) => setEnvVars(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>ConfigMap (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Config path"
                    value={configMapPath}
                    onChange={(e) => setConfigMapPath(e.target.value)}
                  />
                  <Input
                    placeholder="Config value"
                    value={configMapValue}
                    onChange={(e) => setConfigMapValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Storage (optional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Storage name"
                    value={storageName}
                    onChange={(e) => setStorageName(e.target.value)}
                  />
                  <Input
                    placeholder="Mount path"
                    value={storagePath}
                    onChange={(e) => setStoragePath(e.target.value)}
                  />
                  <Input
                    placeholder="Size (e.g., 1Gi)"
                    value={storageSize}
                    onChange={(e) => setStorageSize(e.target.value)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button
          onClick={handleCreate}
          disabled={isCreating || !image.trim()}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Deployment"}
        </Button>
      </CardContent>
    </Card>
  );
}
