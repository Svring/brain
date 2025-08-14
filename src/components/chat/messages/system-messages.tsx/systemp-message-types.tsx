import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ClusterInfoMessageCard } from "./cluster-info-message";
import { DevboxInfoMessageCard } from "./devbox-info-message";

export const SystemMessageType = {
  info: {
    clusterInfo: (payload: any) => <ClusterInfoMessageCard payload={payload} />,
    devboxInfo: (payload: any) => <DevboxInfoMessageCard payload={payload} />,
  },
  warning: {},
  error: {},
};
