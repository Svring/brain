"use client";

import { use, useState } from "react";
import type {
  ClusterCreateRequest,
  DbForm,
} from "@/lib/sealos/cluster/schemas/req-res-schemas/req-res-create-schemas";
import { Button } from "@/components/ui/button";
import {
  createClusterContext,
  generateClusterName,
} from "@/lib/sealos/cluster/cluster-utils";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useCreateClusterMutation } from "@/lib/sealos/cluster/cluster-mutation";
import { CLUSTER_TYPE_VERSION_MAP } from "@/lib/sealos/cluster/cluster-constant";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClusterType = keyof typeof CLUSTER_TYPE_VERSION_MAP;

export default function AddCluster() {
  const { user } = use(AuthContext);
  const [selectedType, setSelectedType] = useState<ClusterType>("postgresql");
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [name, setName] = useState("");
  const [replicas, setReplicas] = useState(1);
  const [cpu, setCpu] = useState(1000);
  const [memory, setMemory] = useState(2048);
  const [storage, setStorage] = useState(10);
  const [created, setCreated] = useState<string | null>(null);

  // Create the context and mutation hook
  const clusterContext = createClusterContext();
  const createClusterMutation = useCreateClusterMutation(clusterContext);

  // Get available versions for selected type
  const availableVersions = CLUSTER_TYPE_VERSION_MAP[selectedType];

  // Set default version when type changes
  const handleTypeChange = (type: ClusterType) => {
    setSelectedType(type);
    setSelectedVersion(availableVersions[0]?.id || "");
  };

  // Initialize default version
  if (!selectedVersion && availableVersions.length > 0) {
    setSelectedVersion(availableVersions[0].id);
  }

  const handleCreate = () => {
    if (!name || !selectedVersion) return;

    const dbForm: DbForm = {
      dbType: selectedType,
      dbVersion: selectedVersion,
      dbName: name || generateClusterName(),
      replicas,
      cpu,
      memory,
      storage,
      labels: {},
      autoBackup: {
        start: false,
        type: "day",
        week: [],
        hour: "0",
        minute: "0",
        saveTime: 7,
        saveType: "d",
      },
      terminationPolicy: "Delete",
    };

    const request: ClusterCreateRequest = {
      dbForm,
      isEdit: false,
    };

    createClusterMutation.mutate(request, {
      onSuccess: () => {
        setCreated(name);
      },
      onError: (error) => {
        console.error("Failed to create cluster:", error);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Configure your database cluster settings:
      </div>

      {/* Cluster Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="cluster-name" className="text-xs font-medium">
          Cluster Name
        </Label>
        <Input
          id="cluster-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter cluster name"
          className="text-sm"
        />
      </div>

      {/* Database Type */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium">Database Type</Label>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select database type" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(CLUSTER_TYPE_VERSION_MAP).map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Database Version */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-medium">Database Version</Label>
        <Select value={selectedVersion} onValueChange={setSelectedVersion}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            {availableVersions.map((version) => (
              <SelectItem key={version.id} value={version.id}>
                {version.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resource Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="replicas" className="text-xs font-medium">
            Replicas
          </Label>
          <Input
            id="replicas"
            type="number"
            min="1"
            value={replicas}
            onChange={(e) => setReplicas(parseInt(e.target.value) || 1)}
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cpu" className="text-xs font-medium">
            CPU (millicores)
          </Label>
          <Input
            id="cpu"
            type="number"
            min="100"
            step="100"
            value={cpu}
            onChange={(e) => setCpu(parseInt(e.target.value) || 1000)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="memory" className="text-xs font-medium">
            Memory (MB)
          </Label>
          <Input
            id="memory"
            type="number"
            min="512"
            step="512"
            value={memory}
            onChange={(e) => setMemory(parseInt(e.target.value) || 2048)}
            className="text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="storage" className="text-xs font-medium">
            Storage (GB)
          </Label>
          <Input
            id="storage"
            type="number"
            min="1"
            value={storage}
            onChange={(e) => setStorage(parseInt(e.target.value) || 10)}
            className="text-sm"
          />
        </div>
      </div>

      <Button
        className="mt-4 w-full"
        onClick={handleCreate}
        disabled={
          createClusterMutation.isPending ||
          !name ||
          !selectedVersion ||
          created === name
        }
      >
        {created === name
          ? "Created"
          : createClusterMutation.isPending
          ? "Creating..."
          : "Create Cluster"}
      </Button>
    </div>
  );
}
