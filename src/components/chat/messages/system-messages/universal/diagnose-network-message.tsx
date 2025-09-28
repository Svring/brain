import React from "react";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { NetworkChart } from "../components/network-chart";

interface DiagnoseNetworkMessageProps {
  target: ResourceTarget;
  payload?: any;
}

export const DiagnoseNetworkMessage: React.FC<DiagnoseNetworkMessageProps> = ({
  target,
  payload,
}) => {
  return (
    <div className="flex justify-start w-full">
      <div className="w-full bg-background-secondary border border-border-primary rounded-lg p-2">
        <NetworkChart networkData={payload} />
      </div>
    </div>
  );
};

export default DiagnoseNetworkMessage;
