import {
  CustomResourceTarget,
  BuiltinResourceTarget,
  ResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import {
  DevboxView,
  ClusterView,
  LaunchpadView,
} from "@/contexts/navigation/navigation-machine";

import DevboxMessage from "./devbox/devbox-message";
import DevboxDeployedMessage from "./devbox/devbox-deployment-message";
import DevboxReleaseMessage from "./devbox/devbox-release-message";
import DevboxCreateMessage from "./devbox/devbox-create-message";
// import DevboxUpdateMessage from "./devbox/devbox-update-message";

import ClusterMessage from "./cluster/cluster-message";
import ClusterBackupMessage from "./cluster/cluster-backup-message";
import ClusterCreateMessage from "./cluster/cluster-create-message";
import ClusterUpdateResource from "./cluster/components/cluster-update/cluster-update-resource";
import ClusterConnectionMessage from "./cluster/cluster-connection-message";

import LaunchpadMessage from "./launchpad/launchpad-message";
import LaunchpadCreateMessage from "./launchpad/launchpad-create-message";
import LaunchpadNetworkMessage from "./launchpad/launchpad-network-message";
import ObjectStorageMessage from "./objectstorage/objectstorage-message";
import ObjectStorageCreateMessage from "./objectstorage/objectstorage-create-message";
import ObjectStorageUpdateMessage from "./objectstorage/objectstorage-update-message";

import MonitorMessage from "./universal/monitor-message";
import LogMessage from "./universal/log-message";
import NetworkMessage from "./universal/network-message";
// import PodOverviewMessage from "./universal/pod-overview-message";
// import PodDetailMessage from "./universal/pod-detail-message";
import DiagnoseNetworkMessage from "./universal/diagnose-network-message";
import AnalyzeStatusMessage from "./universal/analyze-status-message";
import CustomDomainMessage from "./universal/custom-domain-message";
import DevboxNetworkMessage from "./devbox/devbox-network-message";
import { EventMessage } from "./universal/event";
import { ErrorMessage } from "./universal/error-message";
import PreviewMessage from "./universal/preview-message";

export const SystemMessageType = {
  devbox: {
    detail: (target: CustomResourceTarget, view?: DevboxView) => (
      <DevboxMessage target={target} view={view} />
    ),
    deployment: (target: CustomResourceTarget, payload: { tag: string }) => (
      <DevboxDeployedMessage target={target} payload={payload} />
    ),
    release: (target: CustomResourceTarget) => (
      <DevboxReleaseMessage target={target} />
    ),
    create: (payload?: any) => <DevboxCreateMessage payload={payload} />,
    network: (target: CustomResourceTarget) => (
      <DevboxNetworkMessage target={target} />
    ),
  },
  cluster: {
    detail: (target: CustomResourceTarget, view?: ClusterView) => (
      <ClusterMessage target={target} view={view} />
    ),
    backup: (target: CustomResourceTarget) => (
      <ClusterBackupMessage target={target} />
    ),
    connection: (target: CustomResourceTarget) => (
      <ClusterConnectionMessage target={target} />
    ),
    create: (payload?: any) => <ClusterCreateMessage payload={payload} />,
    // update: (target: CustomResourceTarget, payload: any) => (
    //   <ClusterUpdateMessage target={target} payload={payload} />
    // ),
    updateResource: (target: CustomResourceTarget) => (
      <ClusterUpdateResource target={target} />
    ),
  },
  launchpad: {
    detail: (target: BuiltinResourceTarget, view?: LaunchpadView) => (
      <LaunchpadMessage target={target} view={view} />
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
    create: () => <ObjectStorageCreateMessage />,
    update: (target: CustomResourceTarget) => (
      <ObjectStorageUpdateMessage target={target} />
    ),
  },
  universal: {
    monitor: (target: ResourceTarget, payload?: any) => (
      <MonitorMessage target={target} payload={payload} />
    ),
    log: (target: ResourceTarget, payload?: any) => (
      <LogMessage target={target} payload={payload} />
    ),
    network: (target: ResourceTarget) => <NetworkMessage target={target} />,
    diagnoseNetwork: (target: ResourceTarget, payload?: any) => (
      <DiagnoseNetworkMessage target={target} payload={payload} />
    ),
    analyzeStatus: (target: ResourceTarget, payload?: any) => (
      <AnalyzeStatusMessage target={target} payload={payload} />
    ),
    event: (target: any, payload?: any) => (
      <EventMessage target={target} payload={payload} />
    ),
    error: (target: any, payload?: { type: string; error: string }) => (
      <ErrorMessage payload={payload} />
    ),
    preview: (target?: ResourceTarget) => <PreviewMessage target={target} />,
  },
};
