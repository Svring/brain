"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createDeployContext } from "@/lib/auth/auth-utils";
import { useCreateDeployAction } from "@/lib/sealos/deployment/deployment-action/deployment-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToggle } from "@reactuses/core";
import { toast } from "sonner";

export default function AddDeploy() {
  const [image, setImage] = useState("");
  const [port, setPort] = useState<number>(80);
  const [loading, toggleLoading] = useToggle(false);

  // Create the context and mutation hook
  const deployContext = createDeployContext();
  const createDeployAction = useCreateDeployAction(deployContext);

  const handleCreate = () => {
    if (!image) return;

    toggleLoading(true);
    createDeployAction.mutate(
      {
        image,
        ports: [{ number: port, publicAccess: true }],
      },
      {
        onSuccess: () => {
          toggleLoading(false);
          toast.success("Deployment created successfully");
        },
        onError: (error: unknown) => {
          console.error("Failed to create deployment:", error);
          toggleLoading(false);
          toast.error("Failed to create deployment");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="container-image" className="text-sm font-medium">
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

        <div className="space-y-2">
          <Label htmlFor="port-number" className="text-sm font-medium">
            Port Number
          </Label>
          <Input
            id="port-number"
            type="number"
            min="1"
            max="65535"
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value) || 80)}
            placeholder="80"
            className="text-sm"
          />
        </div>
      </div>

      <div className="pt-2 border-t">
        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={loading || !image}
          size="sm"
        >
          {loading ? "Creating..." : "Create Deployment"}
        </Button>
      </div>
    </div>
  );
}
