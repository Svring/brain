import React from "react";
import { Button } from "@/components/ui/button";
import { Container } from "lucide-react";
import { useAppendMessagesMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

interface PodDetailsButtonProps {
  payload: CustomResourceTarget | BuiltinResourceTarget;
}

export const PodDetailsButton: React.FC<PodDetailsButtonProps> = ({ payload }) => {
  const appendMessagesMutation = useAppendMessagesMutation();

  const handleShowPodDetails = () => {
    appendMessagesMutation.mutate([
      {
        role: "system",
        content: {
          type: "manage.podDetails",
          payload: payload,
        },
      },
    ]);
  };

  return (
    <Button
      onClick={handleShowPodDetails}
      className="w-full space-y-4 bg-node-background border border-border-primary"
      variant="outline"
    >
      <Container className="w-4 h-4" />
      View Pod Details
    </Button>
  );
};

export default PodDetailsButton;
