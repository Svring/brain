import React from "react";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ClusterInfoMessage } from "./cluster-info-message/cluster-info-message";

interface ClusterInfoMessageProps {
  payload: ClusterObject | CustomResourceTarget;
}

export const ClusterInfoMessageCard: React.FC<ClusterInfoMessageProps> = ({
  payload,
}) => {
  return <ClusterInfoMessage payload={payload} />;
};

export default ClusterInfoMessageCard;
