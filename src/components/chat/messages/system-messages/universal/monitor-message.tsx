import React from "react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseSystemMessage from "@/components/chat/messages/system-messages/components/base-system-message";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { ArrowBigUpDash, BarChart3 } from "lucide-react";
import { MessageAction } from "@/components/chat/messages/system-messages/components/base-system-message";
import { MonitorChart } from "@/components/chat/messages/system-messages/components/monitor-chart";

interface MonitorMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const MonitorMessage: React.FC<MonitorMessageProps> = ({ target }) => {
  const appendSystemMessageMutation = useAppendSystemMessageMutation();

  const handleUpdateResource = () => {
    const resourceType = target.resourceType?.toLowerCase() || "";
    if (resourceType === "deployment" || resourceType === "statefulset") {
      appendSystemMessageMutation.mutate({ type: "launchpad.updateResource", target });
    }
  };

  const actions: MessageAction[] = [
    {
      icon: ArrowBigUpDash,
      label: "Update Resource Quota",
      onClick: handleUpdateResource,
      disabled: !["deployment", "statefulset"].includes(
        target.resourceType?.toLowerCase() || ""
      ),
    },
  ];

  return (
    <BaseSystemMessage
      className="pb-4"
      headerTitle={{
        icon: BarChart3,
        name: "Resource Metrics",
      }}
      actions={actions}
    >
      <MonitorChart target={target} />
    </BaseSystemMessage>
  );
};

export default MonitorMessage;
