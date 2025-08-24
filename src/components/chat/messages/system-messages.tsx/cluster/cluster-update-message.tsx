"use client";

/**
 * ClusterUpdateMessage Component
 *
 * A flexible component for updating cluster configurations including CPU, memory, storage, and replicas.
 *
 * Usage Examples:
 *
 * 1. Update existing cluster with target:
 * <ClusterUpdateMessage
 *   payload={{
 *     target: { type: "custom", resourceType: "cluster", group: "cluster.sealos.io", version: "v1alpha1", plural: "clusters", name: "my-cluster" },
 *     resource: { cpu: "2000m", memory: "4096MB", storage: "100GB", replicas: 3 },
 *     clusterName: "my-cluster",
 *     status: "Running"
 *   }}
 * />
 *
 * 2. Create new configuration (no target):
 * <ClusterUpdateMessage
 *   payload={{
 *     resource: { cpu: "1000m", memory: "2048MB", storage: "50GB", replicas: 1 },
 *     clusterName: "New Cluster"
 *   }}
 * />
 *
 * 3. Update with streaming parameters:
 * <ClusterUpdateMessage
 *   payload={{
 *     target: target,
 *     resource: { cpu: "4000m", memory: "8192MB", storage: "200GB", replicas: 5 },
 *     clusterName: "High-Performance Cluster",
 *     status: "Running"
 *   }}
 * />
 *
 * 4. Integration with Copilot Actions:
 *
 * export const updateClusterAction = (context: K8sApiContext) => {
 *   useCopilotAction({
 *     name: "updateCluster",
 *     description: "Update cluster configuration with new resources",
 *     parameters: [
 *       {
 *         name: "target",
 *         type: "object",
 *         required: true,
 *         description: "Cluster target configuration",
 *       },
 *       {
 *         name: "cpu",
 *         type: "string",
 *         required: false,
 *         description: "CPU allocation (e.g., '2000m')",
 *       },
 *       {
 *         name: "memory",
 *         type: "string",
 *         required: false,
 *         description: "Memory allocation (e.g., '4096MB')",
 *       },
 *       {
 *         name: "storage",
 *         type: "string",
 *         required: false,
 *         description: "Storage allocation (e.g., '100GB')",
 *       },
 *       {
 *         name: "replicas",
 *         type: "number",
 *         required: false,
 *         description: "Number of replicas",
 *       },
 *     ],
 *     handler: ({ target, cpu, memory, storage, replicas }) => {
 *       return (
 *         <ClusterUpdateMessage
 *           payload={{
 *             target,
 *             resource: {
 *               cpu: cpu || "2000m",
 *               memory: memory || "4096MB",
 *               storage: storage || "100GB",
 *               replicas: replicas || 3
 *             },
 *             clusterName: target.name,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStrategicMergePatchResourceMutation } from "@/lib/k8s/k8s-method/k8s-mutation";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { toast } from "sonner";
import {
  CheckCircle,
  Settings,
  Cpu,
  HardDrive,
  Database,
  Hash,
} from "lucide-react";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import type { ClusterResource } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";

interface ClusterUpdateMessageProps {
  target: CustomResourceTarget;
  payload?: {
    target?: CustomResourceTarget;
    resource?: ClusterResource;
    clusterName?: string;
    status?: string;
  };
}

export default function ClusterUpdateMessage({
  target,
  payload,
}: ClusterUpdateMessageProps) {
  const [cpu, setCpu] = useState<string>(payload?.resource?.cpu || "2000m");
  const [memory, setMemory] = useState<string>(
    payload?.resource?.memory || "4096MB"
  );
  const [storage, setStorage] = useState<string>(
    payload?.resource?.storage || "100GB"
  );
  const [replicas, setReplicas] = useState<number>(
    payload?.resource?.replicas || 3
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const context = createK8sContext();
  const clusterName = payload?.clusterName || target?.name || "Cluster";
  const status = payload?.status || "Unknown";

  const updateMutation = useStrategicMergePatchResourceMutation(context);

  // Update state when payload changes (for streaming parameters)
  useEffect(() => {
    if (payload?.resource?.cpu !== undefined) {
      setCpu(payload.resource.cpu);
    }
    if (payload?.resource?.memory !== undefined) {
      setMemory(payload.resource.memory);
    }
    if (payload?.resource?.storage !== undefined) {
      setStorage(payload.resource.storage);
    }
    if (payload?.resource?.replicas !== undefined) {
      setReplicas(payload.resource.replicas);
    }
  }, [payload]);

  const handleUpdate = async () => {
    if (!target) {
      toast.error("No target specified for update");
      return;
    }

    setIsUpdating(true);
    try {
      // Prepare the patch body for strategic merge
      const patchBody: Record<string, any> = {
        spec: {
          resource: {
            cpu,
            memory,
            storage,
            replicas,
          },
        },
      };

      await updateMutation.mutateAsync({
        target,
        patchBody,
      });

      setIsCompleted(true);
      toast.success("Cluster updated successfully!");
    } catch (error) {
      console.error("Failed to update cluster:", error);
      toast.error("Failed to update cluster");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatValue = (value: string, type: "cpu" | "memory" | "storage") => {
    if (!value) return "N/A";
    if (type === "cpu") return value.endsWith("m") ? value : `${value}m`;
    if (type === "memory") return value.endsWith("MB") ? value : `${value}MB`;
    if (type === "storage") return value.endsWith("GB") ? value : `${value}GB`;
    return value;
  };

  if (isCompleted) {
    return (
      <Card className="w-full bg-background-secondary border border-border-primary">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Cluster Updated Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-medium text-green-900 dark:text-green-100">
                {clusterName}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                CPU: {cpu} • Memory: {memory} • Storage: {storage} • Replicas:{" "}
                {replicas}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Your cluster configuration has been updated successfully.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-background-secondary border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Update Cluster: {clusterName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center gap-2">
          <Badge variant={status === "Running" ? "default" : "secondary"}>
            {status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Current configuration
          </span>
        </div>

        <Separator />

        {/* Resources Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <Label className="text-base font-medium">Resources</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpu">CPU</Label>
              <Select value={cpu} onValueChange={(value) => setCpu(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CPU" />
                </SelectTrigger>
                <SelectContent>
                  {["500m", "1000m", "2000m", "4000m", "6000m", "8000m"].map(
                    (cpuValue) => (
                      <SelectItem key={cpuValue} value={cpuValue}>
                        {cpuValue} ({parseInt(cpuValue) / 1000} cores)
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memory">Memory</Label>
              <Select
                value={memory}
                onValueChange={(value) => setMemory(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Memory" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "512MB",
                    "1024MB",
                    "2048MB",
                    "4096MB",
                    "8192MB",
                    "16000MB",
                  ].map((memoryValue) => (
                    <SelectItem key={memoryValue} value={memoryValue}>
                      {memoryValue} ({parseInt(memoryValue) / 1024}GB)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storage">Storage</Label>
              <Select
                value={storage}
                onValueChange={(value) => setStorage(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Storage" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "10GB",
                    "20GB",
                    "50GB",
                    "100GB",
                    "200GB",
                    "500GB",
                    "1TB",
                  ].map((storageValue) => (
                    <SelectItem key={storageValue} value={storageValue}>
                      {storageValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replicas">Replicas</Label>
              <Select
                value={replicas.toString()}
                onValueChange={(value) => setReplicas(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Replicas" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 5, 7, 10].map((replicaValue) => (
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

          <div className="text-sm text-muted-foreground">
            <p>Resource configuration:</p>
            <p>
              • CPU: {cpu} ({parseInt(cpu) / 1000} cores)
            </p>
            <p>
              • Memory: {memory} ({parseInt(memory) / 1024}GB)
            </p>
            <p>• Storage: {storage}</p>
            <p>• Replicas: {replicas}</p>
          </div>
        </div>

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
            ? "Update Cluster"
            : "No Target Specified"}
        </Button>

        {!target && (
          <div className="text-sm text-muted-foreground text-center">
            <p>Target is required to update cluster configuration.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
