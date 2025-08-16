"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface AppLaunchpadConfigProps {
  configData: any;
  onConfigChange: (field: string, value: any) => void;
}

export default function AppLaunchpadConfig({ configData, onConfigChange }: AppLaunchpadConfigProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="app-name">Name</Label>
        <Input
          id="app-name"
          placeholder="Enter application name"
          value={configData.name || ""}
          onChange={(e) => onConfigChange("name", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="app-image">Docker Image</Label>
        <Input
          id="app-image"
          placeholder="e.g., nginx:latest"
          value={configData.image || ""}
          onChange={(e) => onConfigChange("image", e.target.value)}
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
              onValueChange={(value) => onConfigChange("cpu", value)}
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
              onValueChange={(value) => onConfigChange("memory", value)}
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
              onValueChange={(value) => onConfigChange("replicas", value)}
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
              onConfigChange("ports", newPorts);
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
                  onConfigChange("ports", newPorts);
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
                      onConfigChange("ports", newPorts);
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
                    onConfigChange("ports", newPorts);
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
                    onConfigChange("ports", newPorts);
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
                  onConfigChange("ports", newPorts);
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
            onChange={(e) => onConfigChange("command", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-args">Arguments (Optional)</Label>
          <Input
            id="app-args"
            placeholder="e.g., -c, echo hello"
            value={configData.args || ""}
            onChange={(e) => onConfigChange("args", e.target.value)}
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
              onConfigChange("env", newEnv);
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
                onConfigChange("env", newEnv);
              }}
            />
            <Input
              placeholder="Variable value"
              value={env.value || ""}
              onChange={(e) => {
                const newEnv = [...(configData.env || [])];
                newEnv[index] = { ...env, value: e.target.value };
                onConfigChange("env", newEnv);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newEnv = (configData.env || []).filter((_: any, i: number) => i !== index);
                onConfigChange("env", newEnv);
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
              onConfigChange("storageVolumes", newStorage);
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
                onConfigChange("storageVolumes", newStorage);
              }}
            />
            <Input
              placeholder="Mount path"
              value={storage.path || ""}
              onChange={(e) => {
                const newStorage = [...(configData.storageVolumes || [])];
                newStorage[index] = { ...storage, path: e.target.value };
                onConfigChange("storageVolumes", newStorage);
              }}
            />
            <Select
              value={storage.size || "1Gi"}
              onValueChange={(value) => {
                const newStorage = [...(configData.storageVolumes || [])];
                newStorage[index] = { ...storage, size: value };
                onConfigChange("storageVolumes", newStorage);
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
                onConfigChange("storageVolumes", newStorage);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
