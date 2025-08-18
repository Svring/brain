import { ClusterInfoMessageCard } from "./cluster-info-message";
import { DevboxInfoMessageCard } from "./devbox-info-message/devbox-info-message";
import { ClusterBackupMessageCard } from "./cluster-backup-message";
import { DevboxReleaseMessageCard } from "./devbox-release-message";
import { LaunchpadInfoMessageCard } from "./launchpad-info-message/launchpad-info-message";
import { MetricsMessageCard } from "./metrics-message";
import { ObjectStorageInfoMessageCard } from "./objectstorage-info-message";
import { PodMessageCard } from "./pod-message";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { DiagnoseNetworkMessageCard } from "./diagnose-network-message";
import { CombinedMessage } from "./combined-metrics-message";
import { PodOverview } from "../components/pod-overview";

export const SystemMessageType = {
  info: {
    clusterInfo: (payload: any) => <ClusterInfoMessageCard payload={payload} />,
    devboxInfo: (payload: CustomResourceTarget) => (
      <DevboxInfoMessageCard payload={payload} />
    ),
    clusterBackup: (payload: any) => (
      <ClusterBackupMessageCard payload={payload} />
    ),
    devboxRelease: (payload: any) => (
      <DevboxReleaseMessageCard payload={payload} />
    ),
    launchpadInfo: (payload: any) => (
      <LaunchpadInfoMessageCard payload={payload} />
    ),
    metrics: (payload: any) => <MetricsMessageCard payload={payload} />,
    combinedMetrics: (payload: any) => <CombinedMessage resource={payload} />,
    podOverview: (payload: any) => <PodOverview resource={payload} />,
    objectStorageInfo: (payload: any) => (
      <ObjectStorageInfoMessageCard payload={payload} />
    ),
    pod: (payload: any) => <PodMessageCard payload={payload} />,
  },
  diagnose: {
    network: (payload: CustomResourceTarget) => (
      <DiagnoseNetworkMessageCard payload={payload} />
    ),
  },
  warning: {},
  error: {},
};
