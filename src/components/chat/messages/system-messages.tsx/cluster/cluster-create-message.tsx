"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateClusterMutation } from "@/lib/sealos/resources/cluster/cluster-method/cluster-mutation";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { getClusterVersionsOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { generateClusterName } from "@/lib/sealos/resources/cluster/cluster-utils";
import { toast } from "sonner";
import { CheckCircle, Database } from "lucide-react";

interface ClusterCreateMessageProps {
  payload?: {
    name?: string;
    type?: string;
    version?: string;
    cpu?: number;
    memory?: number;
    storage?: number;
    replicas?: number;
    terminationPolicy?: "Delete" | "WipeOut";
  };
}

export default function ClusterCreateMessage({ payload }: ClusterCreateMessageProps) {
  const [name, setName] = useState(payload?.name || generateClusterName());
  const [dbType, setDbType] = useState<string>(payload?.type || "postgresql");
  const [dbVersion, setDbVersion] = useState<string>(payload?.version || "");
  const [cpu, setCpu] = useState<number>(payload?.cpu || 500);
  const [memory, setMemory] = useState<number>(payload?.memory || 512);
  const [storage, setStorage] = useState<number>(payload?.storage || 10);
  const [replicas, setReplicas] = useState<number>(payload?.replicas || 1);
  const [terminationPolicy, setTerminationPolicy] = useState<"Delete" | "WipeOut">(payload?.terminationPolicy || "Delete");
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdClusterName, setCreatedClusterName] = useState<string>("");

  const context = createSealosContext();
  const createClusterMutation = useCreateClusterMutation(context);
  
  // Fetch cluster versions when a type is selected
  const { data: clusterVersions, isLoading: clusterVersionsLoading } = useQuery(
    getClusterVersionsOptions(context)
  );

  // Update state when payload changes (for streaming parameters)
  useEffect(() => {
    if (payload?.name !== undefined) {
      setName(payload.name);
    }
    if (payload?.type !== undefined) {
      setDbType(payload.type);
    }
    if (payload?.version !== undefined) {
      setDbVersion(payload.version);
    }
    if (payload?.cpu !== undefined) {
      setCpu(payload.cpu);
    }
    if (payload?.memory !== undefined) {
      setMemory(payload.memory);
    }
    if (payload?.storage !== undefined) {
      setStorage(payload.storage);
    }
    if (payload?.replicas !== undefined) {
      setReplicas(payload.replicas);
    }
    if (payload?.terminationPolicy !== undefined) {
      setTerminationPolicy(payload.terminationPolicy);
    }
  }, [payload]);

  const dbTypeOptions = [
    { value: "postgresql", label: "PostgreSQL" },
    { value: "mongodb", label: "MongoDB" },
    { value: "apecloud-mysql", label: "MySQL" },
    { value: "redis", label: "Redis" },
    { value: "kafka", label: "Kafka" },
    { value: "weaviate", label: "Weaviate" },
    { value: "milvus", label: "Milvus" },
    { value: "pulsar", label: "Pulsar" },
  ];

  // Remove the hardcoded getVersionOptions function since we're now fetching dynamically

  const handleCreate = async () => {
    const clusterName = name.trim() || generateClusterName();
    
    if (!dbVersion) {
      toast.error("Please select a version");
      return;
    }

    setIsCreating(true);
    try {
      await createClusterMutation.mutateAsync({
        terminationPolicy,
        name: clusterName,
        type: dbType as any,
        version: dbVersion,
        resource: {
          cpu: `${cpu}m`,
          memory: `${memory}Mi`,
          storage: `${storage}Gi`,
          replicas,
        },
      });

      // Set completion state
      setCreatedClusterName(clusterName);
      setIsCompleted(true);
      toast.success("Cluster created successfully!");
    } catch (error) {
      console.error("Failed to create cluster:", error);
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
            Database Cluster Created Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Database className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {createdClusterName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Type: {dbType} • Version: {dbVersion} • CPU: {cpu}m • Memory: {memory}Mi • Storage: {storage}Gi
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Your database cluster is now ready to use. You can access it from the project dashboard.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-node-background border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Create Database Cluster</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cluster-name">Name</Label>
          <Input
            id="cluster-name"
            placeholder="Enter cluster name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="db-type">Database Type</Label>
          <Select value={dbType} onValueChange={(value) => {
            setDbType(value);
            setDbVersion(""); // Reset version when type changes
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select database type" />
            </SelectTrigger>
            <SelectContent>
              {dbTypeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="db-version">Version</Label>
          <Select 
            value={dbVersion} 
            onValueChange={setDbVersion}
            disabled={!dbType}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !dbType 
                  ? "Select database type first" 
                  : "Select version"
              } />
            </SelectTrigger>
            <SelectContent>
              {clusterVersionsLoading ? (
                <SelectItem value="loading" disabled>
                  Loading versions...
                </SelectItem>
              ) : dbType && clusterVersions?.data?.[dbType] ? (
                // Deduplicate versions by ID to prevent duplicates
                Array.from(
                  new Map(
                    clusterVersions.data[dbType].map((version: any) => [
                      version.id || version,
                      version
                    ])
                  ).values()
                ).map((version: any, index: number) => {
                  const versionValue = version.id || version;
                  const versionLabel = version.label || version.id || version;
                  
                  // Ensure we have a valid non-empty value
                  if (!versionValue || versionValue === "") {
                    return null;
                  }
                  
                  return (
                    <SelectItem key={`${dbType}-${versionValue}-${index}`} value={versionValue}>
                      {versionLabel}
                    </SelectItem>
                  );
                }).filter(Boolean)
              ) : (
                <SelectItem value="no-versions" disabled>
                  {!dbType ? "Select database type first" : "No versions available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="termination-policy">Termination Policy</Label>
          <Select value={terminationPolicy} onValueChange={(value: "Delete" | "WipeOut") => setTerminationPolicy(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select termination policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Delete">Delete</SelectItem>
              <SelectItem value="WipeOut">WipeOut</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem key={memoryValue} value={memoryValue.toString()}>
                    {memoryValue}Mi ({memoryValue / 1024}GB)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="storage">Storage (Gi)</Label>
            <Input
              id="storage"
              type="number"
              value={storage}
              onChange={(e) => setStorage(Number(e.target.value))}
              min="1"
              step="1"
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

        <div className="text-sm text-muted-foreground">
          <p>Resource configuration:</p>
          <p>• CPU: {cpu}m ({cpu/1000} cores)</p>
          <p>• Memory: {memory}Mi ({memory/1024}GB)</p>
          <p>• Storage: {storage}Gi</p>
          <p>• Replicas: {replicas}</p>
          <p>• Termination Policy: {terminationPolicy}</p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={isCreating || !dbVersion}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Cluster"}
        </Button>
      </CardContent>
    </Card>
  );
}
