import {
  CustomResourceTarget,
  BuiltinResourceTarget,
  ResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

import DevboxMessage from "./devbox/devbox-message";
import DevboxDeployedMessage from "./devbox/devbox-deployment-message";
import DevboxReleaseMessage from "./devbox/devbox-release-message";
import DevboxCreateMessage from "./devbox/devbox-create-message";
import DevboxUpdateMessage from "./devbox/devbox-update-message";

import ClusterMessage from "./cluster/cluster-message";
import ClusterBackupMessage from "./cluster/cluster-backup-message";
import ClusterCreateMessage from "./cluster/cluster-create-message";
import ClusterUpdateMessage from "./cluster/cluster-update-message";
import ClusterUpdateResource from "./cluster/components/cluster-update/cluster-update-resource";
import ClusterConnectionMessage from "./cluster/cluster-connection-message";

import LaunchpadMessage from "./launchpad/launchpad-message";
// import LaunchpadUpdateMessage from "./launchpad/launchpad-update-message";
import LaunchpadCreateMessage from "./launchpad/launchpad-create-message";
import LaunchpadNetworkMessage from "./launchpad/launchpad-network-message";
// import LaunchpadUpdateResource from "./launchpad/components/launchpad-update/launchpad-update-resource";
// import LaunchpadUpdateImage from "./launchpad/components/launchpad-update/launchpad-update-image";
// import LaunchpadUpdatePort from "./launchpad/components/launchpad-update/launchpad-update-port";
import ObjectStorageMessage from "./objectstorage/objectstorage-message";
import ObjectStorageCreateMessage from "./objectstorage/objectstorage-create-message";
import ObjectStorageUpdateMessage from "./objectstorage/objectstorage-update-message";

import MonitorMessage from "./universal/monitor-message";
import LogMessage from "./universal/log-message";
import NetworkMessage from "./universal/network-message";
// import PodOverviewMessage from "./universal/pod-overview-message";
// import PodDetailMessage from "./universal/pod-detail-message";
import DiagnoseNetworkMessage from "./universal/diagnose-network-message";
import CustomDomainMessage from "./universal/custom-domain-message";
import DevboxNetworkMessage from "./devbox/devbox-network-message";

export const SystemMessageType = {
  devbox: {
    detail: (target: CustomResourceTarget) => <DevboxMessage target={target} />,
    deployment: (target: CustomResourceTarget, payload: { tag: string }) => (
      <DevboxDeployedMessage target={target} payload={payload} />
    ),
    release: (target: CustomResourceTarget) => (
      <DevboxReleaseMessage target={target} />
    ),
    create: (payload?: any) => <DevboxCreateMessage payload={payload} />,
    update: (target: CustomResourceTarget, payload: any) => (
      <DevboxUpdateMessage target={target} payload={payload} />
    ),
    network: (target: CustomResourceTarget) => (
      <DevboxNetworkMessage target={target} />
    ),
  },
  cluster: {
    detail: (target: CustomResourceTarget) => (
      <ClusterMessage target={target} />
    ),
    backup: (target: CustomResourceTarget) => (
      <ClusterBackupMessage target={target} />
    ),
    connection: (target: CustomResourceTarget) => (
      <ClusterConnectionMessage target={target} />
    ),
    create: (payload?: any) => <ClusterCreateMessage payload={payload} />,
    update: (target: CustomResourceTarget, payload: any) => (
      <ClusterUpdateMessage target={target} payload={payload} />
    ),
    updateResource: (target: CustomResourceTarget) => (
      <ClusterUpdateResource target={target} />
    ),
  },
  launchpad: {
    detail: (target: BuiltinResourceTarget) => (
      <LaunchpadMessage target={target} />
    ),
    create: (payload?: any) => <LaunchpadCreateMessage payload={payload} />,
    network: (target: BuiltinResourceTarget) => (
      <LaunchpadNetworkMessage target={target} />
    ),
    // update: (target: BuiltinResourceTarget, payload: any) => (
    //   <LaunchpadUpdateMessage target={target} payload={payload} />
    // ),
    // updateResource: (target: BuiltinResourceTarget) => (
    //   <LaunchpadUpdateResource target={target} />
    // ),
    // updateImage: (target: BuiltinResourceTarget) => (
    //   <LaunchpadUpdateImage target={target} />
    // ),
    // updatePort: (target: BuiltinResourceTarget) => (
    //   <LaunchpadUpdatePort target={target} />
    // ),
  },
  objectstorage: {
    detail: (target: CustomResourceTarget) => (
      <ObjectStorageMessage target={target} />
    ),
    create: (payload?: any) => <ObjectStorageCreateMessage payload={payload} />,
    update: (target: CustomResourceTarget) => (
      <ObjectStorageUpdateMessage target={target} />
    ),
  },
  universal: {
    monitor: (target: ResourceTarget) => <MonitorMessage target={target} />,
    log: (target: ResourceTarget) => <LogMessage target={target} />,
    network: (target: ResourceTarget) => <NetworkMessage target={target} />,
    // podOverview: (target: ResourceTarget) => (
    //   <PodOverviewMessage target={target} />
    // ),
    // podDetail: (target: ResourceTarget) => <PodDetailMessage target={target} />,
    diagnoseNetwork: (target: ResourceTarget) => (
      <DiagnoseNetworkMessage target={target} />
    ),
    customDomain: (target: ResourceTarget) => (
      <CustomDomainMessage target={target} />
    ),
  },
};
