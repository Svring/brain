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
import { toast } from "sonner";

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

export function ClusterCreateMessage({ payload }: ClusterCreateMessageProps) {
  const [name, setName] = useState(payload?.name || "");
  const [dbType, setDbType] = useState<string>(payload?.type || "postgresql");
  const [dbVersion, setDbVersion] = useState<string>(payload?.version || "15");
  const [cpu, setCpu] = useState<number>(payload?.cpu || 1000);
  const [memory, setMemory] = useState<number>(payload?.memory || 2048);
  const [storage, setStorage] = useState<number>(payload?.storage || 10);
  const [replicas, setReplicas] = useState<number>(payload?.replicas || 1);
  const [terminationPolicy, setTerminationPolicy] = useState<"Delete" | "WipeOut">(payload?.terminationPolicy || "Delete");
  const [isCreating, setIsCreating] = useState(false);

  const context = createSealosContext();
  const createClusterMutation = useCreateClusterMutation(context);

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

  const getVersionOptions = (type: string) => {
    const versions: Record<string, string[]> = {
      postgresql: ["15", "14", "13", "12"],
      mongodb: ["7.0", "6.0", "5.0"],
      "apecloud-mysql": ["8.0", "5.7"],
      redis: ["7.2", "7.0", "6.2"],
      kafka: ["3.5", "3.4", "3.3"],
      weaviate: ["1.22", "1.21", "1.20"],
      milvus: ["2.3", "2.2", "2.1"],
      pulsar: ["3.0", "2.11", "2.10"],
    };
    return versions[type] || ["latest"];
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a cluster name");
      return;
    }

    setIsCreating(true);
    try {
      await createClusterMutation.mutateAsync({
        terminationPolicy,
        name: name.trim(),
        type: dbType as any,
        version: dbVersion,
        resource: {
          cpu: `${cpu}m`,
          memory: `${memory}Mi`,
          storage: `${storage}Gi`,
          replicas,
        },
      });

      // Reset form
      setName("");
      setDbType("postgresql");
      setDbVersion("15");
      setCpu(1000);
      setMemory(2048);
      setStorage(10);
      setReplicas(1);
      setTerminationPolicy("Delete");
      toast.success("Cluster created successfully!");
    } catch (error) {
      console.error("Failed to create cluster:", error);
    } finally {
      setIsCreating(false);
    }
  };

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
            setDbVersion(getVersionOptions(value)[0]);
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
          <Select value={dbVersion} onValueChange={setDbVersion}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {getVersionOptions(dbType).map((version) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
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
              min="512"
              step="512"
            />
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
          disabled={isCreating || !name.trim()}
          className="w-full"
        >
          {isCreating ? "Creating..." : "Create Cluster"}
        </Button>
      </CardContent>
    </Card>
  );
}
