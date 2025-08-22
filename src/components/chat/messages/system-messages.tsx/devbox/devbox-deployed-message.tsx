import React from "react";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useQuery } from "@tanstack/react-query";
import { k8sClient } from "@/components/provider/trpc-provider";
import { APP_DEVBOX_ID } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-label";

interface DevboxDeployedMessageProps {
  payload: CustomResourceTarget;
}

export const DevboxDeployedMessage: React.FC<DevboxDeployedMessageProps> = ({
  payload,
}) => {
  const k8sTrpcClient = k8sClient.useTRPC();

  const { data: allResources } = useQuery(
    k8sTrpcClient.listAllResources.queryOptions({
      labelSelector: `${APP_DEVBOX_ID}=${payload.name}`,
      builtinResourceTypes: ["deployment"],
      customResourceTypes: [],
    })
  );

  console.log("allResources", allResources);

  return (
    <div>
      <h3>Devbox Deployed</h3>
      <p>Resources loaded: {allResources ? "Yes" : "No"}</p>
    </div>
  );
};

export default DevboxDeployedMessage;
