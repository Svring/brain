import { ClusterInfoMessage } from "./info/cluster-info/cluster-info-message";
import { DevboxDeployMessageCard } from "./devbox-deploy-message";
import { ClusterBackupMessageCard } from "./cluster-backup-message";
import { LaunchpadInfoMessageCard } from "./info/launchpad-info/launchpad-info-message";
import { ObjectStorageInfoMessageCard } from "./objectstorage-info-message";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { DiagnoseNetworkMessageCard } from "./universal/diagnose-network-message";
import { MonitorMessage } from "./monitor-message";
import { PodOverview } from "./universal/pod-overview-message";
import { DevboxDeployResponse } from "@/lib/sealos/resources/devbox/devbox-api/devbox-open-api-schemas/devbox-release-schema";
import { CustomDomainMessage } from "./custom-domain-message";
import { NetworkInfoMessage } from "./universal/network-message";
import { DevboxCreateMessage } from "./manage/devbox-create-message";
import { ClusterCreateMessage } from "./manage/cluster-create-message";
import { DeploymentCreateMessage } from "./manage/deployment-create-message";
import { ResourceQuotaUpdateButton } from "./manage/resource-quota-update-button";
import { ResourceQuotaUpdate } from "./manage/resource-quota-update";
import { PodDetailsButton } from "./manage/pod-details-button";
import { PodDetails } from "./universal/pod-details-message";
import { ClusterInfoLog } from "./info/cluster-info/cluster-info-log";
import { LaunchpadInfoLog } from "./info/launchpad-info/launchpad-info-log";
import ResourceLog from "./universal/resource-log-message";
import { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ClusterInfoConnection } from "./info/cluster-info/cluster-info-connection";
import { DevboxInfoMessageCard } from "./devbox/devbox-info-message";
import { DevboxReleaseMessageCard } from "./devbox/devbox-info-release";

export const SystemMessageType = {
  devbox: {
    devboxInfo: (payload: CustomResourceTarget) => (
      <DevboxInfoMessageCard payload={payload} />
    ),
    devboxRelease: (payload: CustomResourceTarget) => (
      <DevboxReleaseMessageCard payload={payload} />
    ),
  },
  info: {
    clusterInfo: (payload: CustomResourceTarget) => (
      <ClusterInfoMessage payload={payload} />
    ),
    devboxInfo: (payload: CustomResourceTarget) => (
      <DevboxInfoMessageCard payload={payload} />
    ),
    devboxDeploy: (payload: DevboxDeployResponse) => (
      <DevboxDeployMessageCard payload={payload} />
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
    clusterLog: (payload: CustomResourceTarget) => (
      <ClusterInfoLog payload={payload} />
    ),
    launchpadLog: (payload: BuiltinResourceTarget) => (
      <LaunchpadInfoLog payload={payload} />
    ),
    resourceLog: (payload: CustomResourceTarget | BuiltinResourceTarget) => (
      <ResourceLog payload={payload} />
    ),
    monitor: (payload: any) => <MonitorMessage target={payload} />,
    podOverview: (payload: any) => <PodOverview target={payload} />,
    objectStorageInfo: (payload: any) => (
      <ObjectStorageInfoMessageCard payload={payload} />
    ),
    customDomain: (payload: any) => <CustomDomainMessage {...payload} />,
    networkInfo: (payload: any) => <NetworkInfoMessage resource={payload} />,
    clusterConnection: (payload: CustomResourceTarget) => (
      <ClusterInfoConnection payload={payload} />
    ),
  },
  manage: {
    devboxCreate: (payload: any) => <DevboxCreateMessage payload={payload} />,
    clusterCreate: (payload: any) => <ClusterCreateMessage payload={payload} />,
    deploymentCreate: (payload: any) => (
      <DeploymentCreateMessage payload={payload} />
    ),
    resourceQuotaUpdateButton: (payload: any) => (
      <ResourceQuotaUpdateButton payload={payload} />
    ),
    resourceQuotaUpdate: (payload: any) => (
      <ResourceQuotaUpdate payload={payload} />
    ),
    podDetailsButton: (payload: any) => <PodDetailsButton payload={payload} />,
    podDetails: (payload: any) => <PodDetails payload={payload} />,
  },
  diagnose: {
    network: (payload: CustomResourceTarget) => (
      <DiagnoseNetworkMessageCard payload={payload} />
    ),
  },
};
