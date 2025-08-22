import {
  devboxClient,
  clusterClient,
  launchpadClient,
  objectStorageClient,
  projectClient,
  k8sClient,
} from "@/components/provider/trpc-provider";

export const useTRPCClients = () => {
  const devboxTrpcClient = devboxClient.useTRPC();
  const clusterTrpcClient = clusterClient.useTRPC();
  const launchpadTrpcClient = launchpadClient.useTRPC();
  const objectStorageTrpcClient = objectStorageClient.useTRPC();
  const projectTrpcClient = projectClient.useTRPC();
  const k8sTrpcClient = k8sClient.useTRPC();

  return {
    devbox: devboxTrpcClient,
    cluster: clusterTrpcClient,
    launchpad: launchpadTrpcClient,
    objectstorage: objectStorageTrpcClient,
    project: projectTrpcClient,
    k8s: k8sTrpcClient,
  };
};
