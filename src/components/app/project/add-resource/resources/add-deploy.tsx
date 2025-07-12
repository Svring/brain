"use client";

import { use, useState } from "react";
import type { DeployCreateRequest } from "@/lib/sealos/deploy/schemas/req-res-schemas/req-res-create-schemas";
import { Button } from "@/components/ui/button";
import {
  createDeployContext,
  generateDeployName,
} from "@/lib/sealos/deploy/deploy-utils";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useCreateDeployMutation } from "@/lib/sealos/deploy/deploy-mutation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";

interface Port {
  number: number;
  publicAccess: boolean;
}

interface EnvVar {
  key: string;
  value: string;
}

export default function AddDeploy() {
  const { user } = use(AuthContext);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [ports, setPorts] = useState<Port[]>([
    { number: 80, publicAccess: false },
  ]);
  const [envVars, setEnvVars] = useState<EnvVar[]>([{ key: "", value: "" }]);
  const [created, setCreated] = useState<string | null>(null);

  // Create the context and mutation hook
  const deployContext = createDeployContext();
  const createDeployMutation = useCreateDeployMutation(deployContext);

  const handleAddPort = () => {
    setPorts([...ports, { number: 8080, publicAccess: false }]);
  };

  const handleRemovePort = (index: number) => {
    if (ports.length > 1) {
      setPorts(ports.filter((_, i) => i !== index));
    }
  };

  const handlePortChange = (
    index: number,
    field: keyof Port,
    value: number | boolean
  ) => {
    const newPorts = [...ports];
    newPorts[index] = { ...newPorts[index], [field]: value };
    setPorts(newPorts);
  };

  const handleAddEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const handleRemoveEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  const handleEnvVarChange = (
    index: number,
    field: keyof EnvVar,
    value: string
  ) => {
    const newEnvVars = [...envVars];
    newEnvVars[index] = { ...newEnvVars[index], [field]: value };
    setEnvVars(newEnvVars);
  };

  const handleCreate = () => {
    if (!name || !image) return;

    // Convert env vars to object, filtering out empty keys
    const env: Record<string, string> = {};
    envVars.forEach(({ key, value }) => {
      if (key.trim()) {
        env[key.trim()] = value;
      }
    });

    const request: DeployCreateRequest = {
      name: name || generateDeployName(),
      image,
      env,
      ports: ports.filter((port) => port.number > 0),
    };

    createDeployMutation.mutate(request, {
      onSuccess: () => {
        setCreated(name);
      },
      onError: (error) => {
        console.error("Failed to create deployment:", error);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="mb-2 text-sm text-muted-foreground">
        Configure your application deployment:
      </div>

      {/* Deployment Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="deploy-name" className="text-xs font-medium">
          Deployment Name
        </Label>
        <Input
          id="deploy-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter deployment name"
          className="text-sm"
        />
      </div>

      {/* Container Image */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="container-image" className="text-xs font-medium">
          Container Image
        </Label>
        <Input
          id="container-image"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="e.g., nginx:latest, node:18-alpine"
          className="text-sm"
        />
      </div>

      {/* Ports Configuration */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Ports</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddPort}
            className="h-6 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {ports.map((port, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="65535"
                value={port.number}
                onChange={(e) =>
                  handlePortChange(
                    index,
                    "number",
                    parseInt(e.target.value) || 80
                  )
                }
                placeholder="Port"
                className="text-sm flex-1"
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`public-${index}`}
                  checked={port.publicAccess}
                  onCheckedChange={(checked) =>
                    handlePortChange(index, "publicAccess", !!checked)
                  }
                />
                <Label htmlFor={`public-${index}`} className="text-xs">
                  Public
                </Label>
              </div>
              {ports.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePort(index)}
                  className="h-6 w-6 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Environment Variables</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEnvVar}
            className="h-6 px-2"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="space-y-2">
          {envVars.map((envVar, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={envVar.key}
                onChange={(e) =>
                  handleEnvVarChange(index, "key", e.target.value)
                }
                placeholder="Key"
                className="text-sm flex-1"
              />
              <Input
                value={envVar.value}
                onChange={(e) =>
                  handleEnvVarChange(index, "value", e.target.value)
                }
                placeholder="Value"
                className="text-sm flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveEnvVar(index)}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        className="mt-4 w-full"
        onClick={handleCreate}
        disabled={
          createDeployMutation.isPending || !name || !image || created === name
        }
      >
        {created === name
          ? "Created"
          : createDeployMutation.isPending
          ? "Creating..."
          : "Create Deployment"}
      </Button>
    </div>
  );
}
