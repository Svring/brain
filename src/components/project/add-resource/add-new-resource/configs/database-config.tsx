"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { createSealosContext } from "@/lib/auth/auth-utils";
import { getClusterVersionsOptions } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import {
  generateClusterCpuOptions,
  generateClusterMemoryOptions,
  generateClusterStorageOptions,
} from "@/lib/sealos/resources/cluster/cluster-utils";

interface DatabaseConfigProps {
  configData: any;
  onConfigChange: (field: string, value: any) => void;
}

export default function DatabaseConfig({ configData, onConfigChange }: DatabaseConfigProps) {
  const sealosContext = createSealosContext();
  
  // Fetch cluster versions when a type is selected
  const { data: clusterVersions, isLoading: clusterVersionsLoading } = useQuery(
    getClusterVersionsOptions(sealosContext)
  );

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="cluster-name">Name</Label>
        <Input
          id="cluster-name"
          placeholder="Enter cluster name"
          value={configData.name || ""}
          onChange={(e) => onConfigChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cluster-type">Database Type</Label>
        <Select
          value={configData.type || ""}
          onValueChange={(value) => onConfigChange("type", value)}
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
          onValueChange={(value) => onConfigChange("version", value)}
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
            onValueChange={(value) => onConfigChange("cpu", value)}
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
            onValueChange={(value) => onConfigChange("memory", value)}
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
            onValueChange={(value) => onConfigChange("storage", value)}
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
            onValueChange={(value) => onConfigChange("replicas", value)}
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
  );
}
