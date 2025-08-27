"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import LaunchpadCreateMessage from "@/components/chat/messages/system-messages.tsx/launchpad/launchpad-create-message";
import { LaunchpadCreateRequest } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-open-api-schemas/launchpad-create-schema";

interface DeploymentCreateMessageProps {
  payload?: LaunchpadCreateRequest;
  testMode?: boolean;
}

export default function LaunchpadCreateDemo() {
  const [payload, setPayload] = useState<
    DeploymentCreateMessageProps["payload"]
  >({
    name: "my-app",
    image: "nginx:latest",
    command: "/bin/bash",
    args: "-c 'echo Hello World'",
    // Resource object matching LaunchpadCreateRequest format
    resource: {
      replicas: 2,
      cpu: 1,
      memory: 2
    },
    // Ports array matching LaunchpadCreateRequest format
    ports: [
      { port: 80, protocol: "TCP", exposesPublicDomain: true },
      { port: 443, protocol: "TCP", appProtocol: "HTTP", exposesPublicDomain: false }
    ],
    // Environment variables as array matching LaunchpadCreateRequest format
    env: [
      { name: "NODE_ENV", value: "production" },
      { name: "PORT", value: "3000" }
    ],
    // Storage as array matching LaunchpadCreateRequest format
    storage: [
      { name: "app-storage", path: "/app/data", size: "5Gi" as const }
    ],
    // ConfigMap as array matching LaunchpadCreateRequest format
    configMap: [
      { path: "/app/config", value: "key1=value1\nkey2=value2" }
    ],
    // Optional fields
    hpa: null,
    imageRegistry: null,
  });

  // Test mode is always enabled on this demo page
  const testMode = true;

  // Port management state - matches the PortSchema format
  const [ports, setPorts] = useState<Array<{ port: number; protocol: "TCP" | "UDP" | "SCTP"; appProtocol?: "HTTP" | "GRPC" | "WS"; exposesPublicDomain: boolean }>>([
    { port: 80, protocol: "TCP", appProtocol: "HTTP", exposesPublicDomain: true },
    { port: 443, protocol: "TCP", exposesPublicDomain: false }
  ]);
  const [newPort, setNewPort] = useState(8080);
  const [newPortType, setNewPortType] = useState<"TCP" | "HTTP" | "UDP" | "WS" | "GRPC" | "SCTP">("TCP");
  const [newPortPublic, setNewPortPublic] = useState(true);

  // Environment variables state
  const [newEnvName, setNewEnvName] = useState("");
  const [newEnvValue, setNewEnvValue] = useState("");

  // Storage state
  const [newStorageName, setNewStorageName] = useState("");
  const [newStoragePath, setNewStoragePath] = useState("");
  const [newStorageSize, setNewStorageSize] = useState<"1Gi" | "5Gi" | "10Gi" | "20Gi">("1Gi");

  // ConfigMap state
  const [newConfigMapPath, setNewConfigMapPath] = useState("");
  const [newConfigMapValue, setNewConfigMapValue] = useState("");

  const updatePayload = (
    key: keyof NonNullable<DeploymentCreateMessageProps["payload"]>,
    value: any
  ) => {
    setPayload((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  // Helper functions to update nested objects
  const updateResource = (field: keyof NonNullable<NonNullable<DeploymentCreateMessageProps["payload"]>["resource"]>, value: any) => {
    setPayload((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        resource: {
          ...prev.resource,
          [field]: value,
        },
      };
    });
  };

  const updateEnv = (index: number, field: 'name' | 'value', value: string) => {
    setPayload((prev) => {
      if (!prev) return prev;
      const currentEnv = prev.env || [];
      const newEnv = [...currentEnv];
      if (newEnv[index]) {
        newEnv[index] = { ...newEnv[index], [field]: value };
      } else {
        newEnv[index] = field === 'name' ? { name: value, value: '' } : { name: '', value };
      }
      return {
        ...prev,
        env: newEnv,
      };
    });
  };

  const addEnv = () => {
    if (newEnvName.trim()) {
      setPayload((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          env: [...(prev.env || []), { name: newEnvName.trim(), value: newEnvValue.trim() }],
        };
      });
      setNewEnvName("");
      setNewEnvValue("");
    }
  };

  const removeEnv = (index: number) => {
    setPayload((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        env: (prev.env || []).filter((_, i) => i !== index),
      };
    });
  };

  const updateStorage = (index: number, field: 'name' | 'path' | 'size', value: string | "1Gi" | "5Gi" | "10Gi" | "20Gi") => {
    setPayload((prev) => {
      if (!prev) return prev;
      const currentStorage = prev.storage || [];
      const newStorage = [...currentStorage];
      if (newStorage[index]) {
        newStorage[index] = { ...newStorage[index], [field]: value };
      } else {
        newStorage[index] = field === 'name' ? { name: value, path: '', size: '1Gi' as const } :
                           field === 'path' ? { name: '', path: value, size: '1Gi' as const } :
                           { name: '', path: '', size: value as "1Gi" | "5Gi" | "10Gi" | "20Gi" };
      }
      return {
        ...prev,
        storage: newStorage,
      };
    });
  };

  const updateConfigMap = (index: number, field: 'path' | 'value', value: string) => {
    setPayload((prev) => {
      if (!prev) return prev;
      const currentConfigMap = prev.configMap || [];
      const newConfigMap = [...currentConfigMap];
      if (newConfigMap[index]) {
        newConfigMap[index] = { ...newConfigMap[index], [field]: value };
      } else {
        newConfigMap[index] = field === 'path' ? { path: value, value: '' } : { path: '', value };
      }
      return {
        ...prev,
        configMap: newConfigMap,
      };
    });
  };

  const addStorage = () => {
    if (newStorageName.trim() && newStoragePath.trim()) {
      setPayload((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          storage: [...(prev.storage || []), {
            name: newStorageName.trim(),
            path: newStoragePath.trim(),
            size: newStorageSize
          }],
        };
      });
      setNewStorageName("");
      setNewStoragePath("");
      setNewStorageSize("1Gi");
    }
  };

  const removeStorage = (index: number) => {
    setPayload((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        storage: (prev.storage || []).filter((_, i) => i !== index),
      };
    });
  };

  const addConfigMap = () => {
    if (newConfigMapPath.trim()) {
      setPayload((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          configMap: [...(prev.configMap || []), {
            path: newConfigMapPath.trim(),
            value: newConfigMapValue.trim()
          }],
        };
      });
      setNewConfigMapPath("");
      setNewConfigMapValue("");
    }
  };

  const removeConfigMap = (index: number) => {
    setPayload((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        configMap: (prev.configMap || []).filter((_, i) => i !== index),
      };
    });
  };

  // Convert port type to protocol/appProtocol combination
  const getProtocolFromPortType = (portType: "TCP" | "HTTP" | "UDP" | "WS" | "GRPC" | "SCTP") => {
    switch (portType) {
      case "TCP":
        return { protocol: "TCP" as const, appProtocol: undefined };
      case "UDP":
        return { protocol: "UDP" as const, appProtocol: undefined };
      case "SCTP":
        return { protocol: "SCTP" as const, appProtocol: undefined };
      case "HTTP":
        return { protocol: "TCP" as const, appProtocol: "HTTP" as const };
      case "WS":
        return { protocol: "TCP" as const, appProtocol: "WS" as const };
      case "GRPC":
        return { protocol: "TCP" as const, appProtocol: "GRPC" as const };
    }
  };

  // Add a new port
  const addPort = () => {
    const { protocol, appProtocol } = getProtocolFromPortType(newPortType);
    const newPortObj = {
      port: newPort,
      protocol,
      appProtocol,
      exposesPublicDomain: newPortPublic
    };
    const updatedPorts = [...ports, newPortObj];
    setPorts(updatedPorts);

    // Update payload ports array
    updatePayload("ports", updatedPorts);
  };

  // Remove a port
  const removePort = (index: number) => {
    const updatedPorts = ports.filter((_, i) => i !== index);
    setPorts(updatedPorts);

    // Update payload ports array
    updatePayload("ports", updatedPorts);
  };

  // Update port public status
  const updatePortPublic = (index: number, exposesPublicDomain: boolean) => {
    const updatedPorts = ports.map((p, i) =>
      i === index ? { ...p, exposesPublicDomain } : p
    );
    setPorts(updatedPorts);

    // Update payload ports array
    updatePayload("ports", updatedPorts);
  };

  const resetPayload = () => {
    const defaultPorts: Array<{ port: number; protocol: "TCP" | "UDP" | "SCTP"; appProtocol?: "HTTP" | "GRPC" | "WS"; exposesPublicDomain: boolean }> = [
      { port: 80, protocol: "TCP", exposesPublicDomain: true }
    ];
    setPorts(defaultPorts);
    setPayload({
      name: "",
      image: "",
      command: "",
      args: "",
      resource: {
        replicas: 0,
        cpu: 0,
        memory: 0
      },
      ports: defaultPorts,
      env: [],
      storage: [],
      configMap: [],
      hpa: null,
      imageRegistry: null,
    });
  };

  const loadExampleData = (example: string) => {
    const examples: Record<string, {
      payload: DeploymentCreateMessageProps["payload"];
      ports: Array<{ port: number; protocol: "TCP" | "UDP" | "SCTP"; appProtocol?: "HTTP" | "GRPC" | "WS"; exposesPublicDomain: boolean }>;
    }> = {
      "nginx-basic": {
        payload: {
          name: "nginx-app",
          image: "nginx:1.21",
          command: "",
          args: "",
          resource: {
            replicas: 1,
            cpu: 0.5,
            memory: 1
          },
          ports: [{ port: 80, protocol: "TCP", exposesPublicDomain: true }],
          env: [],
          storage: [],
          configMap: [],
          hpa: null,
          imageRegistry: null,
        },
        ports: [{ port: 80, protocol: "TCP", exposesPublicDomain: true }]
      },
      "node-express": {
        payload: {
          name: "node-api",
          image: "node:18-alpine",
          command: "npm",
          args: "start",
          resource: {
            replicas: 3,
            cpu: 1,
            memory: 2
          },
          ports: [{ port: 3000, protocol: "TCP", exposesPublicDomain: true }],
          env: [
            { name: "NODE_ENV", value: "production" },
            { name: "PORT", value: "3000" }
          ],
          storage: [],
          configMap: [],
          hpa: null,
          imageRegistry: null,
        },
        ports: [{ port: 3000, protocol: "TCP", exposesPublicDomain: true }]
      },
      "postgres-db": {
        payload: {
          name: "postgres-db",
          image: "postgres:15",
          command: "",
          args: "",
          resource: {
            replicas: 1,
            cpu: 2,
            memory: 4
          },
          ports: [{ port: 5432, protocol: "TCP", exposesPublicDomain: false }],
          env: [
            { name: "POSTGRES_DB", value: "mydb" },
            { name: "POSTGRES_USER", value: "admin" },
            { name: "POSTGRES_PASSWORD", value: "password" }
          ],
          storage: [
            { name: "postgres-data", path: "/var/lib/postgresql/data", size: "10Gi" }
          ],
          configMap: [],
          hpa: null,
          imageRegistry: null,
        },
        ports: [{ port: 5432, protocol: "TCP", exposesPublicDomain: false }]
      },
      "react-app": {
        payload: {
          name: "react-frontend",
          image: "nginx:alpine",
          command: "",
          args: "",
          resource: {
            replicas: 2,
            cpu: 0.2,
            memory: 0.5
          },
          ports: [
            { port: 80, protocol: "TCP", exposesPublicDomain: true },
            { port: 443, protocol: "TCP", appProtocol: "HTTP", exposesPublicDomain: true }
          ],
          env: [],
          storage: [],
          configMap: [
            { path: "/usr/share/nginx/html", value: "<!DOCTYPE html><html><body><h1>Hello from React!</h1></body></html>" }
          ],
          hpa: null,
          imageRegistry: null,
        },
        ports: [
          { port: 80, protocol: "TCP", exposesPublicDomain: true },
          { port: 443, protocol: "TCP", appProtocol: "HTTP", exposesPublicDomain: true }
        ]
      },
    };

    const exampleData = examples[example];
    if (exampleData) {
      setPayload(exampleData.payload);
      setPorts(exampleData.ports);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Launchpad Create Message Demo</h1>
          <p className="text-muted-foreground mt-2">
            Modify the payload data below and see how it affects the launchpad
            create component
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Test Mode:</strong> This demo page runs in test mode by default. The component will prevent completion and only show what would be created.
              Perfect for safely testing configurations without actually deploying.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payload Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Payload Editor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap items-center">
                <Button
                  variant="outline"
                  onClick={() => loadExampleData("nginx-basic")}
                  size="sm"
                >
                  Nginx Basic
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExampleData("node-express")}
                  size="sm"
                >
                  Node.js API
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExampleData("postgres-db")}
                  size="sm"
                >
                  PostgreSQL
                </Button>
                <Button
                  variant="outline"
                  onClick={() => loadExampleData("react-app")}
                  size="sm"
                >
                  React App
                </Button>
                <Button variant="destructive" onClick={resetPayload} size="sm">
                  Reset
                </Button>


              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={payload?.name || ""}
                    onChange={(e) => updatePayload("name", e.target.value)}
                    placeholder="deployment name"
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    value={payload?.image || ""}
                    onChange={(e) => updatePayload("image", e.target.value)}
                    placeholder="nginx:latest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="command">Command</Label>
                  <Input
                    id="command"
                    value={payload?.command || ""}
                    onChange={(e) => updatePayload("command", e.target.value)}
                    placeholder="/bin/bash"
                  />
                </div>
                <div>
                  <Label htmlFor="args">Args</Label>
                  <Input
                    id="args"
                    value={payload?.args || ""}
                    onChange={(e) => updatePayload("args", e.target.value)}
                    placeholder="-c 'echo hello'"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cpu">CPU (C)</Label>
                  <div className="relative">
                                          <Input
                        id="cpu"
                        type="number"
                        value={payload?.resource?.cpu || ""}
                        onChange={(e) =>
                          updateResource(
                            "cpu",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="1"
                        className="pr-8"
                      />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      C
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="memory">Memory (G)</Label>
                  <div className="relative">
                                          <Input
                        id="memory"
                        type="number"
                        value={payload?.resource?.memory || ""}
                        onChange={(e) =>
                          updateResource(
                            "memory",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        placeholder="2"
                        className="pr-8"
                      />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                      G
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="replicas">Replicas</Label>
                                        <Input
                        id="replicas"
                        type="number"
                        value={payload?.resource?.replicas || ""}
                        onChange={(e) =>
                          updateResource(
                            "replicas",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="1"
                      />
                </div>
              </div>

              {/* Port Configuration Section */}
              <div>
                <Label className="text-base font-semibold">Port Configuration</Label>
                <div className="space-y-4 mt-2">
                  {/* Add New Port */}
                  <Card className="p-3 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label htmlFor="newPort" className="text-sm font-medium">Port Number</Label>
                        <Input
                          id="newPort"
                          type="number"
                          value={newPort}
                          onChange={(e) => setNewPort(parseInt(e.target.value) || 8080)}
                          placeholder="8080"
                          min="1"
                          max="65535"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="newPortType" className="text-sm font-medium">Protocol</Label>
                        <Select value={newPortType} onValueChange={(value: "TCP" | "HTTP" | "UDP" | "WS" | "GRPC" | "SCTP") => setNewPortType(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TCP">TCP</SelectItem>
                            <SelectItem value="HTTP">HTTP</SelectItem>
                            <SelectItem value="UDP">UDP</SelectItem>
                            <SelectItem value="SCTP">SCTP</SelectItem>
                            <SelectItem value="WS">WebSocket</SelectItem>
                            <SelectItem value="GRPC">gRPC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pb-2">
                        <Switch
                          id="newPortPublic"
                          checked={newPortPublic}
                          onCheckedChange={setNewPortPublic}
                        />
                        <Label htmlFor="newPortPublic" className="text-sm font-medium whitespace-nowrap">
                          Public Access
                        </Label>
                      </div>
                      <Button onClick={addPort} size="sm" variant="outline" className="mb-2">
                        Add Port
                      </Button>
                    </div>
                  </Card>

                  {/* Current Ports List */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Configured Ports:</Label>
                    {ports.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No ports configured</p>
                    ) : (
                      <div className="space-y-2">
                        {ports.map((port, index) => (
                          <Card key={index} className="p-3 border border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Port</span>
                                  <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                                    {port.port}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Protocol:</span>
                                  <span className="text-sm font-medium">
                                    {port.protocol}{port.appProtocol ? ` (${port.appProtocol})` : ''}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={port.exposesPublicDomain}
                                    onCheckedChange={(checked) => updatePortPublic(index, checked)}
                                  />
                                  <Label className="text-sm font-medium">
                                    {port.exposesPublicDomain ? 'Public' : 'Private'}
                                  </Label>
                                </div>

                                <Button
                                  onClick={() => removePort(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Environment Variables Section */}
              <div>
                <Label className="text-base font-semibold">Environment Variables</Label>
                <div className="space-y-3 mt-2">
                  {/* Add New Environment Variable */}
                  <Card className="p-3 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label htmlFor="newEnvName" className="text-sm font-medium">Variable Name</Label>
                        <Input
                          id="newEnvName"
                          placeholder="NODE_ENV"
                          value={newEnvName}
                          onChange={(e) => setNewEnvName(e.target.value)}
                          className="mt-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addEnv();
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="newEnvValue" className="text-sm font-medium">Value</Label>
                        <Input
                          id="newEnvValue"
                          placeholder="production"
                          value={newEnvValue}
                          onChange={(e) => setNewEnvValue(e.target.value)}
                          className="mt-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addEnv();
                            }
                          }}
                        />
                      </div>
                      <Button onClick={addEnv} size="sm" variant="outline" className="mb-2">
                        Add
                      </Button>
                    </div>
                  </Card>

                  {/* Current Environment Variables */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Configured Variables:</Label>
                    {(!payload?.env || payload.env.length === 0) ? (
                      <p className="text-sm text-muted-foreground italic">No environment variables configured</p>
                    ) : (
                      <div className="space-y-2">
                        {payload.env.map((env, index) => (
                          <Card key={index} className="p-3 border border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Name:</span>
                                  <Input
                                    value={env.name || ""}
                                    onChange={(e) => updateEnv(index, 'name', e.target.value)}
                                    className="w-32"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Value:</span>
                                  <Input
                                    value={env.value || ""}
                                    onChange={(e) => updateEnv(index, 'value', e.target.value)}
                                    className="w-48"
                                  />
                                </div>
                              </div>
                              <Button
                                onClick={() => removeEnv(index)}
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Storage Configuration Section */}
              <div>
                <Label className="text-base font-semibold">Storage Configuration</Label>
                <div className="space-y-3 mt-2">
                  {/* Add New Storage */}
                  <Card className="p-3 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label htmlFor="newStorageName" className="text-sm font-medium">Storage Name</Label>
                        <Input
                          id="newStorageName"
                          placeholder="app-storage"
                          value={newStorageName}
                          onChange={(e) => setNewStorageName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="newStoragePath" className="text-sm font-medium">Mount Path</Label>
                        <Input
                          id="newStoragePath"
                          placeholder="/app/data"
                          value={newStoragePath}
                          onChange={(e) => setNewStoragePath(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="newStorageSize" className="text-sm font-medium">Size</Label>
                        <Select value={newStorageSize} onValueChange={(value: "1Gi" | "5Gi" | "10Gi" | "20Gi") => setNewStorageSize(value)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1Gi">1 GiB</SelectItem>
                            <SelectItem value="5Gi">5 GiB</SelectItem>
                            <SelectItem value="10Gi">10 GiB</SelectItem>
                            <SelectItem value="20Gi">20 GiB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addStorage} size="sm" variant="outline" className="mb-2">
                        Add Storage
                      </Button>
                    </div>
                  </Card>

                  {/* Current Storage */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Configured Storage:</Label>
                    {(!payload?.storage || payload.storage.length === 0) ? (
                      <p className="text-sm text-muted-foreground italic">No storage configured</p>
                    ) : (
                      <div className="space-y-2">
                        {payload.storage.map((storage, index) => (
                          <Card key={index} className="p-3 border border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Name:</span>
                                  <Input
                                    value={storage.name || ""}
                                    onChange={(e) => updateStorage(index, 'name', e.target.value)}
                                    className="w-32"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Path:</span>
                                  <Input
                                    value={storage.path || ""}
                                    onChange={(e) => updateStorage(index, 'path', e.target.value)}
                                    className="w-48"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Size:</span>
                                  <Select
                                    value={storage.size || ""}
                                    onValueChange={(value) => updateStorage(index, 'size', value)}
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1Gi">1 GiB</SelectItem>
                                      <SelectItem value="5Gi">5 GiB</SelectItem>
                                      <SelectItem value="10Gi">10 GiB</SelectItem>
                                      <SelectItem value="20Gi">20 GiB</SelectItem>
                                      <SelectItem value="50Gi">50 GiB</SelectItem>
                                      <SelectItem value="100Gi">100 GiB</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ConfigMap Configuration Section */}
              <div>
                <Label className="text-base font-semibold">ConfigMap Configuration</Label>
                <div className="space-y-3 mt-2">
                  {/* Add New ConfigMap */}
                  <Card className="p-3 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Label htmlFor="newConfigMapPath" className="text-sm font-medium">Mount Path</Label>
                        <Input
                          id="newConfigMapPath"
                          placeholder="/app/config"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="newConfigMapValue" className="text-sm font-medium">Configuration Value</Label>
                        <Input
                          id="newConfigMapValue"
                          placeholder="key1=value1"
                          className="mt-1"
                        />
                      </div>
                      <Button size="sm" variant="outline" className="mb-2">
                        Add ConfigMap
                      </Button>
                    </div>
                  </Card>

                  {/* Current ConfigMap */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Configured ConfigMaps:</Label>
                    {(!payload?.configMap || payload.configMap.length === 0) ? (
                      <p className="text-sm text-muted-foreground italic">No configMap configured</p>
                    ) : (
                      <div className="space-y-2">
                        {payload.configMap.map((configMap, index) => (
                          <Card key={index} className="p-3 border border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Path:</span>
                                  <Input
                                    value={configMap.path || ""}
                                    onChange={(e) => updateConfigMap(index, 'path', e.target.value)}
                                    className="w-48"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">Value:</span>
                                  <Input
                                    value={configMap.value || ""}
                                    onChange={(e) => updateConfigMap(index, 'value', e.target.value)}
                                    className="w-64"
                                  />
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Payload Display */}
          <Card>
            <CardHeader>
              <CardTitle>Current Payload</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-64">
                {JSON.stringify(payload, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Launchpad Create Component Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Launchpad Create Message Component</CardTitle>
            <p className="text-sm text-muted-foreground">
              This component uses the payload data above to pre-populate its
              form fields
            </p>
          </CardHeader>
          <CardContent>
            <LaunchpadCreateMessage payload={payload} testMode={testMode} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
