"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Terminal, 
  Database, 
  Rocket, 
  HardDrive,
  Plus,
  X,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useCreateDevboxMutation } from "@/lib/sealos/resources/devbox/devbox-method/devbox-mutation";
import { useCreateClusterMutation } from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { useCreateLaunchpadMutation } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-mutation";
import { useCreateObjectStorageMutation } from "@/lib/sealos/resources/objectstorage/objectstorage-method/objectstorage-mutation";
import { useAddToProjectMutation } from "@/lib/brain/resources/project/project-method/project-mutation";
import { createDevboxContext, createSealosContext, createK8sContext } from "@/lib/auth/auth-utils";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { useProjectState } from "@/contexts/project/project-context";
import { getClusterVersionsOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  generateClusterCpuOptions,
  generateClusterMemoryOptions,
  generateClusterStorageOptions,
} from "@/lib/sealos/resources/cluster/cluster-utils";

export default function AddNewResourceTab() {
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [configData, setConfigData] = useState<any>({
    cpu: "1000m",
    memory: "1024Mi",
    storage: "3Gi",
    replicas: "1",
    ports: [
      {
        port: "8080",
        protocol: "TCP",
        appProtocol: "HTTP",
        exposesPublicDomain: false,
      }
    ],
    command: "",
    args: "",
    env: [],
    storageVolumes: [],
  });
  
  // Get selected project from context
  const { selectedProject } = useProjectState();

  // Create contexts for mutations
  const devboxContext = createDevboxContext();
  const sealosContext = createSealosContext();
  const k8sContext = createK8sContext();

  // Initialize mutations
  const createDevbox = useCreateDevboxMutation(devboxContext);
  const createCluster = useCreateClusterMutation(sealosContext);
  const createLaunchpad = useCreateLaunchpadMutation(sealosContext);
  const createObjectStorage = useCreateObjectStorageMutation(sealosContext);
  const addToProject = useAddToProjectMutation(k8sContext);

  // Check if any mutation is in progress
  const isCreating = createDevbox.isPending || createCluster.isPending || 
                     createLaunchpad.isPending || createObjectStorage.isPending || 
                     addToProject.isPending;

  // Fetch cluster versions when a type is selected
  const { data: clusterVersions, isLoading: clusterVersionsLoading } = useQuery(
    getClusterVersionsOptions(sealosContext)
  );

  // Clear version when type changes since available versions depend on type
  useEffect(() => {
    if (selectedResource === "database" && configData.type) {
      setConfigData((prev: any) => ({ ...prev, version: "" }));
    }
  }, [configData.type, selectedResource]);

  const resourceTypes = [
    {
      id: "devbox",
      title: "Devbox",
      description: "Create a cloud development environment with pre-configured tools and runtime",
      icon: Terminal,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      hoverColor: "hover:bg-blue-100",
    },
    {
      id: "database",
      title: "Database",
      description: "Deploy managed database services like PostgreSQL, MongoDB, MySQL, and more",
      icon: Database,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      hoverColor: "hover:bg-green-100",
    },
    {
      id: "applaunchpad",
      title: "App Launchpad",
      description: "Deploy containerized applications with auto-scaling and load balancing",
      icon: Rocket,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      hoverColor: "hover:bg-purple-100",
    },
    {
      id: "objectstoragebucket",
      title: "Object Storage",
      description: "Create scalable object storage buckets for files, backups, and static assets",
      icon: HardDrive,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      hoverColor: "hover:bg-orange-100",
    },
  ];

  const handleCreateResource = (resourceType: string) => {
    setSelectedResource(resourceType);
    setConfigData({
      cpu: "1000m",
      memory: "1024Mi",
      storage: "3Gi",
      replicas: "1",
      ports: [
        {
          port: "8080",
          protocol: "TCP",
          appProtocol: "HTTP",
          exposesPublicDomain: false,
        }
      ],
      command: "",
      args: "",
      env: [],
      storageVolumes: [],
    });
  };

  const handleBack = () => {
    setSelectedResource(null);
    setConfigData({
      cpu: "1000m",
      memory: "1024Mi",
      storage: "3Gi",
      replicas: "1",
      ports: [
        {
          port: "8080",
          protocol: "TCP",
          appProtocol: "HTTP",
          exposesPublicDomain: false,
        }
      ],
      command: "",
      args: "",
      env: [],
      storageVolumes: [],
    });
  };

  const handleConfigChange = (field: string, value: any) => {
    setConfigData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedResource) return;
    if (!selectedProject) {
      toast.error("No project selected. Please select a project first.");
      return;
    }

    try {
      // Create the resource first
      switch (selectedResource) {
        case "devbox":
          await createDevbox.mutateAsync({
            name: configData.name,
            runtimeName: configData.runtimeName,
            cpu: parseInt(configData.cpu) || 2000,
            memory: parseInt(configData.memory) || 4096,
          });
          break;
        case "database":
          await createCluster.mutateAsync({
            name: configData.name,
            type: configData.type,
            version: configData.version,
            terminationPolicy: "Delete",
            resource: {
              cpu: configData.cpu || "1000m",
              memory: configData.memory || "1024Mi",
              storage: configData.storage || "3Gi",
              replicas: parseInt(configData.replicas) || 1,
            },
          });
          break;
        case "applaunchpad":
          await createLaunchpad.mutateAsync({
            name: configData.name,
            image: configData.image,
            storage: configData.storageVolumes || [],
            resource: {
              cpu: parseInt(configData.cpu) || 200,
              memory: parseInt(configData.memory) || 256,
              replicas: parseInt(configData.replicas) || 1,
            },
            env: configData.env || [],
            command: configData.command || "",
            args: configData.args || "",
            ports: (configData.ports || []).map((port: any) => ({
              port: parseInt(port.port) || 80,
              protocol: (port.protocol as "TCP" | "UDP" | "SCTP") || "TCP",
              appProtocol: (port.appProtocol as "HTTP" | "GRPC" | "WS") || "HTTP",
              exposesPublicDomain: port.exposesPublicDomain === true,
            })),
            configMap: [],
            hpa: null,
            imageRegistry: null,
          });
          break;
        case "objectstoragebucket":
          await createObjectStorage.mutateAsync({
            bucketName: configData.name,
            bucketPolicy: configData.policy,
          });
          break;
      }

      // Add the created resource to the project
      // Map resource types to their correct Kubernetes resource types
      const getResourceTypeForTarget = (resourceType: string) => {
        switch (resourceType) {
          case "database":
            return "cluster";
          case "applaunchpad":
            return "deployment";
          case "devbox":
            return "devbox";
          case "objectstoragebucket":
            return "objectstoragebucket";
          default:
            return resourceType;
        }
      };
      
      const resourceTarget = convertResourceTypeToTarget(
        getResourceTypeForTarget(selectedResource), 
        configData.name
      );
      await addToProject.mutateAsync({
        resources: [resourceTarget],
        name: selectedProject,
      });
      
      toast.success(`${resourceTypes.find(r => r.id === selectedResource)?.title} created and added to project successfully!`);
      handleBack();
    } catch (error) {
      console.error("Failed to create resource:", error);
      toast.error("Failed to create resource. Please try again.");
    }
  };

  const renderConfigCard = () => {
    if (!selectedResource) return null;

    const resource = resourceTypes.find(r => r.id === selectedResource);
    if (!resource) return null;

    const IconComponent = resource.icon;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${resource.bgColor}`}>
              <IconComponent className={`h-6 w-6 ${resource.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">Create {resource.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{resource.description}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedResource === "devbox" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="devbox-name">Name</Label>
                <Input
                  id="devbox-name"
                  placeholder="Enter devbox name"
                  value={configData.name || ""}
                  onChange={(e) => handleConfigChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="devbox-runtime">Runtime</Label>
                <Select
                  value={configData.runtimeName || ""}
                  onValueChange={(value) => handleConfigChange("runtimeName", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select runtime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Debian">Debian</SelectItem>
                    <SelectItem value="C++">C++</SelectItem>
                    <SelectItem value="Rust">Rust</SelectItem>
                    <SelectItem value="Java">Java</SelectItem>
                    <SelectItem value="Go">Go</SelectItem>
                    <SelectItem value="Python">Python</SelectItem>
                    <SelectItem value="Node.js">Node.js</SelectItem>
                    <SelectItem value=".Net">.Net</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="PHP">PHP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="devbox-cpu">CPU (m)</Label>
                  <Select
                    value={configData.cpu || ""}
                    onValueChange={(value) => handleConfigChange("cpu", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CPU" />
                    </SelectTrigger>
                    <SelectContent>
                      {[500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000].map((cpu) => (
                        <SelectItem key={cpu} value={cpu.toString()}>
                          {cpu}m
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="devbox-memory">Memory (MB)</Label>
                  <Select
                    value={configData.memory || ""}
                    onValueChange={(value) => handleConfigChange("memory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Memory" />
                    </SelectTrigger>
                    <SelectContent>
                      {[512, 1024, 1536, 2048, 2560, 3072, 3584, 4096, 4608, 5120, 5632, 6144, 6656, 7168, 7680, 8192].map((memory) => (
                        <SelectItem key={memory} value={memory.toString()}>
                          {memory} MB
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {selectedResource === "database" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cluster-name">Name</Label>
                <Input
                  id="cluster-name"
                  placeholder="Enter cluster name"
                  value={configData.name || ""}
                  onChange={(e) => handleConfigChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cluster-type">Database Type</Label>
                <Select
                  value={configData.type || ""}
                  onValueChange={(value) => handleConfigChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="mongodb">MongoDB</SelectItem>
                    <SelectItem value="apecloud-mysql">ApeCloud MySQL</SelectItem>
                    <SelectItem value="redis">Redis</SelectItem>
                    <SelectItem value="kafka">Kafka</SelectItem>
                    <SelectItem value="qdrant">Qdrant</SelectItem>
                    <SelectItem value="nebula">Nebula</SelectItem>
                    <SelectItem value="weaviate">Weaviate</SelectItem>
                    <SelectItem value="milvus">Milvus</SelectItem>
                    <SelectItem value="pulsar">Pulsar</SelectItem>
                    <SelectItem value="clickhouse">ClickHouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cluster-version">Version</Label>
                <Select
                  value={configData.version || ""}
                  onValueChange={(value) => handleConfigChange("version", value)}
                  disabled={!configData.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !configData.type 
                        ? "Select database type first" 
                        : "Select version"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {clusterVersionsLoading ? (
                      <SelectItem value="" disabled>
                        Loading versions...
                      </SelectItem>
                    ) : configData.type && clusterVersions?.data?.[configData.type] ? (
                      // Deduplicate versions by ID to prevent duplicates
                      Array.from(
                        new Map(
                          clusterVersions.data[configData.type].map((version: any) => [
                            version.id || version,
                            version
                          ])
                        ).values()
                      ).map((version: any, index: number) => (
                        <SelectItem key={`${configData.type}-${version.id || version}-${index}`} value={version.id || version}>
                          {version.label || version.id || version}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-versions" disabled>
                        {!configData.type ? "Select database type first" : "No versions available"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cluster-cpu">CPU</Label>
                  <Select
                    value={configData.cpu || ""}
                    onValueChange={(value) => handleConfigChange("cpu", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CPU" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateClusterCpuOptions().map((cpu) => (
                        <SelectItem key={cpu} value={cpu}>
                          {cpu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cluster-memory">Memory</Label>
                  <Select
                    value={configData.memory || ""}
                    onValueChange={(value) => handleConfigChange("memory", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Memory" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateClusterMemoryOptions().map((memory) => (
                        <SelectItem key={memory} value={memory}>
                          {memory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cluster-storage">Storage</Label>
                  <Select
                    value={configData.storage || ""}
                    onValueChange={(value) => handleConfigChange("storage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Storage" />
                    </SelectTrigger>
                    <SelectContent>
                      {generateClusterStorageOptions().map((storage) => (
                        <SelectItem key={storage} value={storage}>
                          {storage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cluster-replicas">Replicas</Label>
                  <Select
                    value={configData.replicas || ""}
                    onValueChange={(value) => handleConfigChange("replicas", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Replicas" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 3 }, (_, i) => i + 1).map((replica) => (
                        <SelectItem key={replica} value={replica.toString()}>
                          {replica}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}

          {selectedResource === "applaunchpad" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="app-name">Name</Label>
                <Input
                  id="app-name"
                  placeholder="Enter application name"
                  value={configData.name || ""}
                  onChange={(e) => handleConfigChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-image">Docker Image</Label>
                <Input
                  id="app-image"
                  placeholder="e.g., nginx:latest"
                  value={configData.image || ""}
                  onChange={(e) => handleConfigChange("image", e.target.value)}
                />
              </div>
              
              {/* Resource Configuration */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Resource Configuration</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app-cpu" className="text-xs">CPU (m)</Label>
                    <Select
                      value={configData.cpu || ""}
                      onValueChange={(value) => handleConfigChange("cpu", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CPU" />
                      </SelectTrigger>
                      <SelectContent>
                        {[100, 200, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000].map((cpu) => (
                          <SelectItem key={cpu} value={cpu.toString()}>
                            {cpu}m
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-memory" className="text-xs">Memory (MB)</Label>
                    <Select
                      value={configData.memory || ""}
                      onValueChange={(value) => handleConfigChange("memory", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Memory" />
                      </SelectTrigger>
                      <SelectContent>
                        {[128, 256, 512, 1024, 1536, 2048, 3072, 4096, 6144, 8192].map((memory) => (
                          <SelectItem key={memory} value={memory.toString()}>
                            {memory} MB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app-replicas" className="text-xs">Replicas</Label>
                    <Select
                      value={configData.replicas || ""}
                      onValueChange={(value) => handleConfigChange("replicas", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Replicas" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((replica) => (
                          <SelectItem key={replica} value={replica.toString()}>
                            {replica}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Port Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Port Configuration</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPorts = [...(configData.ports || []), {
                        port: "8080",
                        protocol: "TCP",
                        appProtocol: "HTTP",
                        exposesPublicDomain: false,
                      }];
                      handleConfigChange("ports", newPorts);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Port
                  </Button>
                </div>
                {(configData.ports || []).map((port: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Port {index + 1}</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPorts = (configData.ports || []).filter((_: any, i: number) => i !== index);
                          handleConfigChange("ports", newPorts);
                        }}
                        disabled={(configData.ports || []).length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Port</Label>
                        <Input
                          type="number"
                          min="1"
                          max="65535"
                          placeholder="1-65535"
                          value={port.port || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Only allow valid port numbers
                            if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 65535)) {
                              const newPorts = [...(configData.ports || [])];
                              newPorts[index] = { ...port, port: value };
                              handleConfigChange("ports", newPorts);
                            }
                          }}
                          className="text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Protocol</Label>
                        <Select
                          value={port.protocol || "TCP"}
                          onValueChange={(value) => {
                            const newPorts = [...(configData.ports || [])];
                            newPorts[index] = { ...port, protocol: value };
                            handleConfigChange("ports", newPorts);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Protocol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TCP">TCP</SelectItem>
                            <SelectItem value="UDP">UDP</SelectItem>
                            <SelectItem value="SCTP">SCTP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">App Protocol</Label>
                        <Select
                          value={port.appProtocol || "HTTP"}
                          onValueChange={(value) => {
                            const newPorts = [...(configData.ports || [])];
                            newPorts[index] = { ...port, appProtocol: value };
                            handleConfigChange("ports", newPorts);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select App Protocol" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HTTP">HTTP</SelectItem>
                            <SelectItem value="GRPC">gRPC</SelectItem>
                            <SelectItem value="WS">WebSocket</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`app-exposesPublicDomain-${index}`}
                        checked={port.exposesPublicDomain === true}
                        onChange={(e) => {
                          const newPorts = [...(configData.ports || [])];
                          newPorts[index] = { ...port, exposesPublicDomain: e.target.checked };
                          handleConfigChange("ports", newPorts);
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`app-exposesPublicDomain-${index}`} className="text-sm">
                        Expose Public Domain
                      </Label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Command & Args */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="app-command">Command (Optional)</Label>
                  <Input
                    id="app-command"
                    placeholder="e.g., /bin/bash"
                    value={configData.command || ""}
                    onChange={(e) => handleConfigChange("command", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-args">Arguments (Optional)</Label>
                  <Input
                    id="app-args"
                    placeholder="e.g., -c, echo hello"
                    value={configData.args || ""}
                    onChange={(e) => handleConfigChange("args", e.target.value)}
                  />
                </div>
              </div>

              {/* Environment Variables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Environment Variables</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newEnv = [...(configData.env || []), { name: "", value: "" }];
                      handleConfigChange("env", newEnv);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variable
                  </Button>
                </div>
                {(configData.env || []).map((env: any, index: number) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Variable name"
                      value={env.name || ""}
                      onChange={(e) => {
                        const newEnv = [...(configData.env || [])];
                        newEnv[index] = { ...env, name: e.target.value };
                        handleConfigChange("env", newEnv);
                      }}
                    />
                    <Input
                      placeholder="Variable value"
                      value={env.value || ""}
                      onChange={(e) => {
                        const newEnv = [...(configData.env || [])];
                        newEnv[index] = { ...env, value: e.target.value };
                        handleConfigChange("env", newEnv);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newEnv = (configData.env || []).filter((_: any, i: number) => i !== index);
                        handleConfigChange("env", newEnv);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Storage Configuration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Storage Volumes</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStorage = [...(configData.storageVolumes || []), { name: "", path: "", size: "1Gi" }];
                      handleConfigChange("storageVolumes", newStorage);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Volume
                  </Button>
                </div>
                {(configData.storageVolumes || []).map((storage: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input
                      placeholder="Volume name"
                      value={storage.name || ""}
                      onChange={(e) => {
                        const newStorage = [...(configData.storageVolumes || [])];
                        newStorage[index] = { ...storage, name: e.target.value };
                        handleConfigChange("storageVolumes", newStorage);
                      }}
                    />
                    <Input
                      placeholder="Mount path"
                      value={storage.path || ""}
                      onChange={(e) => {
                        const newStorage = [...(configData.storageVolumes || [])];
                        newStorage[index] = { ...storage, path: e.target.value };
                        handleConfigChange("storageVolumes", newStorage);
                      }}
                    />
                    <Select
                      value={storage.size || "1Gi"}
                      onValueChange={(value) => {
                        const newStorage = [...(configData.storageVolumes || [])];
                        newStorage[index] = { ...storage, size: value };
                        handleConfigChange("storageVolumes", newStorage);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["1Gi", "2Gi", "5Gi", "10Gi", "20Gi", "50Gi", "100Gi"].map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                                            onClick={() => {
                        const newStorage = (configData.storageVolumes || []).filter((_: any, i: number) => i !== index);
                        handleConfigChange("storageVolumes", newStorage);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedResource === "objectstoragebucket" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="storage-name">Bucket Name</Label>
                <Input
                  id="storage-name"
                  placeholder="Enter storage bucket name"
                  value={configData.name || ""}
                  onChange={(e) => handleConfigChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storage-policy">Bucket Policy</Label>
                <Select
                  value={configData.policy || ""}
                  onValueChange={(value) => handleConfigChange("policy", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bucket policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="publicRead">Public Read</SelectItem>
                    <SelectItem value="publicReadWrite">Public Read/Write</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleBack} className="flex-1" disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={
                isCreating ||
                !configData.name || 
                (selectedResource === "devbox" && !configData.runtimeName) ||
                (selectedResource === "database" && (!configData.type || !configData.version)) ||
                (selectedResource === "applaunchpad" && (!configData.image || !configData.replicas || !configData.cpu || !configData.memory || !configData.ports || configData.ports.length === 0)) ||
                (selectedResource === "objectstoragebucket" && !configData.policy)
              }
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                `Create ${resource.title}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (selectedResource) {
    return renderConfigCard();
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Create New Resources</h3>
        <p className="text-sm text-muted-foreground">
          Choose a resource type to create and add to your project
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resourceTypes.map((resource) => {
          const IconComponent = resource.icon;
          
          return (
            <Card 
              key={resource.id}
              className={`transition-all duration-200 ${resource.borderColor} ${
                isCreating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer ' + resource.hoverColor + ' hover:shadow-md'
              }`}
              onClick={() => !isCreating && handleCreateResource(resource.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${resource.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${resource.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 p-1 h-8 w-8"
                    disabled={isCreating}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isCreating) {
                        handleCreateResource(resource.id);
                      }
                    }}
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
