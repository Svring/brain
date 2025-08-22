// TODO: Merge this component to the main component
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowBigUpDash } from "lucide-react";
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
    // <div className="space-y-4 bg-node-background border border-border-primary rounded-xl">
    <Button
      onClick={handleUpdateResourceQuota}
      className="w-full space-y-4 bg-node-background border border-border-primary"
      variant="outline"
    >
      <ArrowBigUpDash className="w-4 h-4" />
      Update Resource Quota
    </Button>
    // </div>
  );
};

export default ResourceQuotaUpdateButton;
