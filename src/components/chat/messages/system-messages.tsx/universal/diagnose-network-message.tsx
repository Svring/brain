import React from "react";
import { ScanSearch } from "lucide-react";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseActionMessage from "../components/base-action-message";

interface DiagnoseNetworkMessageProps {
  target: CustomResourceTarget | BuiltinResourceTarget;
}

export const DiagnoseNetworkMessageCard: React.FC<
  DiagnoseNetworkMessageProps
> = ({ target }) => {
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

export default DiagnoseNetworkMessageCard;
