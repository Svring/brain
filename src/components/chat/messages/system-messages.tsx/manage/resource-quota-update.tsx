import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResourceQuotaUpdate } from "@/hooks/sealos/resource/use-resource-quota-update";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { toast } from "sonner";

interface ResourceQuotaUpdateProps {
  payload: CustomResourceTarget | BuiltinResourceTarget;
}

export const ResourceQuotaUpdate: React.FC<ResourceQuotaUpdateProps> = ({
  payload,
}) => {
  const { updateResourceQuota, mutation, isSupported } =
    useResourceQuotaUpdate(payload);

  const [quotaData, setQuotaData] = useState({
    cpu: 1,
    memory: 2,
    replicas: 1,
  });

  const handleInputChange = (field: keyof typeof quotaData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setQuotaData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleUpdateQuota = async () => {
    if (!isSupported()) {
      toast.error("Resource type not supported for quota update");
      return;
    }

    try {
      await updateResourceQuota({
        resource: quotaData,
      });
      toast.success("Resource quota updated successfully");
    } catch (error) {
      console.error("Failed to update resource quota:", error);
      toast.error("Failed to update resource quota");
    }
  };

  if (!isSupported()) {
    return (
      <Card className="bg-node-background border border-border-primary">
        <CardHeader>
          <CardTitle className="text-lg">Resource Quota Update</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This resource type is not supported for quota updates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-node-background border border-border-primary">
      <CardHeader>
        <CardTitle className="text-lg">Resource Quota Update</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update resource quotas for {payload.name || payload.resourceType}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cpu">CPU (cores)</Label>
            <Input
              id="cpu"
              type="number"
              min="0.1"
              step="0.1"
              value={quotaData.cpu}
              onChange={(e) => handleInputChange("cpu", e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memory">Memory (GB)</Label>
            <Input
              id="memory"
              type="number"
              min="0.1"
              step="0.1"
              value={quotaData.memory}
              onChange={(e) => handleInputChange("memory", e.target.value)}
              placeholder="2.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="replicas">Replicas</Label>
            <Input
              id="replicas"
              type="number"
              min="1"
              step="1"
              value={quotaData.replicas}
              onChange={(e) => handleInputChange("replicas", e.target.value)}
              placeholder="1"
            />
          </div>
        </div>

        <Button
          onClick={handleUpdateQuota}
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Updating..." : "Update Resource Quota"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResourceQuotaUpdate;
