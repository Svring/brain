import React from "react";
import { ScanSearch } from "lucide-react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseActionMessage from "../components/base-action-message";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";

interface DiagnoseNetworkMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const DiagnoseNetworkMessage: React.FC<DiagnoseNetworkMessageProps> = ({
  target,
}) => {
  const { resource } = useResourceStatus(target);
  const { readyStatus } = useNetworkStatus(target);

  console.log("readyStatus", readyStatus);

  return (
    <BaseActionMessage
      headerTitle={{
        icon: ScanSearch,
        name: "Diagnosis",
      }}
    >
      <div className="space-y-3">
        {/* Component content will be added here */}
      </div>
    </BaseActionMessage>
  );
};

export default DiagnoseNetworkMessage;
