import React from "react";
import { Globe } from "lucide-react";
import type {
  DevboxObject,
  DevboxPort,
} from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useAppendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { MessageAction } from "@/components/chat/messages/system-messages.tsx/components/base-action-message";
import BaseActionMessage from "../components/base-action-message";
import { PortDisplayTable } from "../components/port-display-table";

interface NetworkMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export default function NetworkMessage({ target }: NetworkMessageProps) {
  const { appendSystemMessage } = useAppendSystemMessageMutation();

  const { resource } = useResourceStatus(target);

  const ports = (resource as DevboxObject)?.ports || [];

  const actions: MessageAction[] = [
    {
      icon: Globe,
      label: "Update Ports",
      onClick: () => {
        // Only support launchpad resources (deployment/statefulset) for now
        if (
          target.type === "builtin" &&
          ["deployment", "statefulset"].includes(
            target.resourceType.toLowerCase()
          )
        ) {
          appendSystemMessage("launchpad.updatePort", target);
        }
      },
    },
  ];

  if (!resource || !ports || ports.length === 0) {
    return null;
  }

  return (
    <BaseActionMessage
      headerTitle={{
        icon: Globe,
        name: "Network Ports",
      }}
      actions={actions}
    >
      <div className="space-y-3">
        <PortDisplayTable ports={ports} />
      </div>
    </BaseActionMessage>
  );
}
