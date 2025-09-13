import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseSystemMessage from "@/components/chat/messages/system-messages.tsx/components/base-system-message";
import { Tag } from "lucide-react";
import { ReleaseChart } from "@/components/chat/messages/system-messages.tsx/components/release-chart";

interface DevboxReleaseMessageProps {
  target: CustomResourceTarget;
}

export const DevboxReleaseMessage: React.FC<DevboxReleaseMessageProps> = ({
  target,
}) => {
  return (
    <BaseSystemMessage headerTitle={{ icon: Tag, name: "Devbox Releases" }}>
      <ReleaseChart target={target} />
    </BaseSystemMessage>
  );
};

export default DevboxReleaseMessage;
