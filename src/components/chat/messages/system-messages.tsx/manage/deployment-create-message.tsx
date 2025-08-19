"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateLaunchpadMutation } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { toast } from "sonner";

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

export function DeploymentCreateMessage({ payload }: DeploymentCreateMessageProps) {
  const [name, setName] = useState(payload?.name || "");
  const [image, setImage] = useState(payload?.image || "");
  const [command, setCommand] = useState(payload?.command || "");
  const [args, setArgs] = useState(payload?.args || "");
  const [cpu, setCpu] = useState<number>(payload?.cpu || 200);
  const [memory, setMemory] = useState<number>(payload?.memory || 256);
  const [replicas, setReplicas] = useState<number>(payload?.replicas || 1);
  const [ports, setPorts] = useState(payload?.ports || "80");
  const [portProtocol, setPortProtocol] = useState<"TCP" | "UDP" | "SCTP">(payload?.portProtocol || "TCP");
  const [appProtocol, setAppProtocol] = useState<"HTTP" | "GRPC" | "WS">(payload?.appProtocol || "HTTP");
  const [exposesPublicDomain, setExposesPublicDomain] = useState<boolean>(payload?.exposesPublicDomain ?? true);
  const [envVars, setEnvVars] = useState(payload?.envVars || "");
  const [storageName, setStorageName] = useState(payload?.storageName || "");
  const [storagePath, setStoragePath] = useState(payload?.storagePath || "");
  const [storageSize, setStorageSize] = useState(payload?.storageSize || "1Gi");
  const [configMapPath, setConfigMapPath] = useState(payload?.configMapPath || "");
  const [configMapValue, setConfigMapValue] = useState(payload?.configMapValue || "");
  const [isCreating, setIsCreating] = useState(false);

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
    if (!name.trim() || !image.trim()) {
      toast.error("Please enter both name and image");
      return;
    }

    setIsCreating(true);
    try {
      // Parse environment variables
      const envArray = envVars
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [key, ...valueParts] = line.split('=');
          return {
            name: key.trim(),
            value: valueParts.join('=').trim()
          };
        });

      // Parse ports
      const portArray = ports
        .split(',')
        .map(port => parseInt(port.trim()))
        .filter(port => !isNaN(port))
        .map(port => ({
          port,
          protocol: portProtocol,
          appProtocol,
          exposesPublicDomain,
        }));

      // Build storage array
      const storageArray = storageName && storagePath ? [{
        name: storageName,
        path: storagePath,
        size: storageSize,
      }] : [];

      // Build configMap array
      const configMapArray = configMapPath ? [{
        path: configMapPath,
        value: configMapValue,
      }] : [];

      await createLaunchpadMutation.mutateAsync({
        name: name.trim(),
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

      // Reset form
      setName("");
      setImage("");
      setCommand("");
      setArgs("");
      setCpu(200);
      setMemory(256);
      setReplicas(1);
      setPorts("80");
      setPortProtocol("TCP");
      setAppProtocol("HTTP");
      setExposesPublicDomain(true);
      setEnvVars("");
      setStorageName("");
      setStoragePath("");
      setStorageSize("1Gi");
      setConfigMapPath("");
      setConfigMapValue("");
      toast.success("Deployment created successfully!");
    } catch (error) {
      console.error("Failed to create deployment:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full bg-node-background border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Create Deployment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpu">CPU (m)</Label>
            <Input
              id="cpu"
              type="number"
              value={cpu}
              onChange={(e) => setCpu(Number(e.target.value))}
              min="100"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memory">Memory (Mi)</Label>
            <Input
              id="memory"
              type="number"
              value={memory}
              onChange={(e) => setMemory(Number(e.target.value))}
              min="128"
              step="128"
            />
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
            <Select value={portProtocol} onValueChange={(value: "TCP" | "UDP" | "SCTP") => setPortProtocol(value)}>
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
            <Select value={appProtocol} onValueChange={(value: "HTTP" | "GRPC" | "WS") => setAppProtocol(value)}>
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
            <Select value={exposesPublicDomain.toString()} onValueChange={(value) => setExposesPublicDomain(value === "true")}>
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

        <div className="space-y-2">
          <Label htmlFor="env-vars">Environment Variables (one per line, KEY=VALUE)</Label>
          <Textarea
            id="env-vars"
            placeholder="NODE_ENV=production&#10;DATABASE_URL=postgresql://..."
            value={envVars}
            onChange={(e) => setEnvVars(e.target.value)}
            rows={3}
          />
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

        <div className="text-sm text-muted-foreground">
          <p>Common images:</p>
          <p>• nginx:latest</p>
          <p>• node:18-alpine</p>
          <p>• python:3.11-slim</p>
          <p>• postgres:15</p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={isCreating || !name.trim() || !image.trim()}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Deployment"}
        </Button>
      </CardContent>
    </Card>
  );
}
