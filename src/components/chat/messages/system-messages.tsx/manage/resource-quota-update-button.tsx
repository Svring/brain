import React from "react";
import { Button } from "@/components/ui/button";
import { useAppendMessagesMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface ResourceQuotaUpdateButtonProps {
  payload: CustomResourceTarget | BuiltinResourceTarget;
}

export const ResourceQuotaUpdateButton: React.FC<
  ResourceQuotaUpdateButtonProps
> = ({ payload }) => {
  const appendMessagesMutation = useAppendMessagesMutation();

  const handleUpdateResourceQuota = () => {
    appendMessagesMutation.mutate([
      {
        role: "system",
        content: {
          type: "manage.resourceQuotaUpdate",
          payload: payload,
        },
      },
    ]);
  };

  return (
    <div className="space-y-4 bg-node-background border border-border-primary rounded-xl p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Resource Quota Management</h3>
        <p className="text-sm text-muted-foreground">
          Update resource quotas for your cluster resources
        </p>
      </div>
      <Button
        onClick={handleUpdateResourceQuota}
        className="w-full"
        variant="outline"
      >
        Update Resource Quota
      </Button>
    </div>
  );
};

export default ResourceQuotaUpdateButton;
