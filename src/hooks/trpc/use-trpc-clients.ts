import {
  devboxClient,
  clusterClient,
  launchpadClient,
  objectStorageClient,
  projectClient,
  k8sClient,
  langgraphClient,
  costCenterClient,
  aiProxyClient,
} from "@/components/provider/trpc-provider";

export const useTRPCClients = () => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const clusterTrpcClient = clusterClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();
  const objectStorageTrpcClient = objectStorageClient.useTRPC();
  const projectTrpcClient = projectClient.useTRPC();
  const k8sTrpcClient = k8sClient.useTRPC();
  const langgraphTrpcClient = langgraphClient.useTRPC();
  const costCenterTrpcClient = costCenterClient.useTRPC();
  const aiProxyTrpcClient = aiProxyClient.useTRPC();

  return {
    devbox: devboxTrpcClient,
    cluster: clusterTrpcClient,
    launchpad: launchpadTrpcClient,
    objectstorage: objectStorageTrpcClient,
    project: projectTrpcClient,
    k8s: k8sTrpcClient,
    langgraph: langgraphTrpcClient,
    costCenter: costCenterTrpcClient,
    aiProxy: aiProxyTrpcClient,
  };
};
