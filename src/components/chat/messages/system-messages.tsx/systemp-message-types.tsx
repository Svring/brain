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

import LaunchpadMessage from "./launchpad/launchpad-message";
import LaunchpadUpdateMessage from "./launchpad/launchpad-update-message";
import LaunchpadCreateMessage from "./launchpad/launchpad-create-message";

import ObjectStorageMessage from "./objectstorage/objectstorage-message";
import ObjectStorageCreateMessage from "./objectstorage/objectstorage-create-message";
import ObjectStorageUpdateMessage from "./objectstorage/objectstorage-update-message";

import MonitorMessage from "./universal/monitor-message";
import LogMessage from "./universal/log-message";
import NetworkMessage from "./universal/network-message";
import PodOverviewMessage from "./universal/pod-overview-message";
import PodDetailMessage from "./universal/pod-detail-message";
import DiagnoseNetworkMessage from "./universal/diagnose-network-message";

export const SystemMessageType = {
  devbox: {
    detail: (target: CustomResourceTarget) => <DevboxMessage target={target} />,
    deployment: (target: CustomResourceTarget) => (
      <DevboxDeployedMessage target={target} />
    ),
    release: (target: CustomResourceTarget) => (
      <DevboxReleaseMessage target={target} />
    ),
    create: (payload: any) => <DevboxCreateMessage payload={payload} />,
    update: (target: CustomResourceTarget, payload: any) => (
      <DevboxUpdateMessage target={target} payload={payload} />
    ),
  },
  cluster: {
    detail: (target: CustomResourceTarget) => (
      <ClusterMessage target={target} />
    ),
    backup: (target: CustomResourceTarget) => (
      <ClusterBackupMessage target={target} />
    ),
    create: (payload: any) => <ClusterCreateMessage payload={payload} />,
    update: (target: CustomResourceTarget, payload: any) => (
      <ClusterUpdateMessage target={target} payload={payload} />
    ),
  },
  launchpad: {
    detail: (target: BuiltinResourceTarget) => (
      <LaunchpadMessage target={target} />
    ),
    create: (payload: any) => <LaunchpadCreateMessage payload={payload} />,
    update: (target: BuiltinResourceTarget, payload: any) => (
      <LaunchpadUpdateMessage target={target} payload={payload} />
    ),
  },
  objectstorage: {
    detail: (target: CustomResourceTarget) => (
      <ObjectStorageMessage target={target} />
    ),
    create: (payload: any) => <ObjectStorageCreateMessage payload={payload} />,
    update: (target: CustomResourceTarget, payload: any) => (
      <ObjectStorageUpdateMessage target={target} payload={payload} />
    ),
  },
  universal: {
    monitor: (target: ResourceTarget) => <MonitorMessage target={target} />,
    log: (target: ResourceTarget) => <LogMessage target={target} />,
    network: (target: ResourceTarget) => <NetworkMessage target={target} />,
    podOverview: (target: ResourceTarget) => (
      <PodOverviewMessage target={target} />
    ),
    podDetail: (target: ResourceTarget) => <PodDetailMessage target={target} />,
    diagnoseNetwork: (target: ResourceTarget) => (
      <DiagnoseNetworkMessage target={target} />
    ),
  },
};
