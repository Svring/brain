import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useResourceQuotaUpdate } from "@/hooks/sealos/resource/use-resource-quota-update";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { toast } from "sonner";
import MessageHeader from "../components/message-header";

interface ResourceQuotaUpdateProps {
  payload: CustomResourceTarget | BuiltinResourceTarget;
}

export const ResourceQuotaUpdate: React.FC<ResourceQuotaUpdateProps> = ({
  payload,
}) => {
  const { updateResourceQuota, mutation, isSupported } =
    useResourceQuotaUpdate(payload);

  // Predefined option sets for each resource type
  const cpuOptions = [0.5, 1, 2, 4, 8, 16];
  const memoryOptions = [1, 2, 4, 8, 16, 32];
  const replicaOptions = [1, 2, 3, 4, 5, 10];

  const [quotaData, setQuotaData] = useState({
    cpu: 1,
    memory: 2,
    replicas: 1,
  });

  const handleSelectChange = (field: keyof typeof quotaData, value: string) => {
    const numValue = parseFloat(value);
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
        <div className="space-y-4">
          <MessageHeader target={payload} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CPU Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">CPU (cores)</Label>
          <div className="grid grid-cols-6 gap-2">
            {cpuOptions.map((option) => (
              <Button
                key={option}
                variant={quotaData.cpu === option ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectChange("cpu", option.toString())}
                className="h-12"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Memory Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Memory (GB)</Label>
          <div className="grid grid-cols-6 gap-2">
            {memoryOptions.map((option) => (
              <Button
                key={option}
                variant={quotaData.memory === option ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectChange("memory", option.toString())}
                className="h-12"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Replicas Section */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Replicas</Label>
          <div className="grid grid-cols-6 gap-2">
            {replicaOptions.map((option) => (
              <Button
                key={option}
                variant={quotaData.replicas === option ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleSelectChange("replicas", option.toString())
                }
                className="h-12"
              >
                {option}
              </Button>
            ))}
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
