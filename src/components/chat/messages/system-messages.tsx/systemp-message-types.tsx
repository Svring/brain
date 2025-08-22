import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

import DevboxMessage from "./devbox/devbox-message";
import DevboxDeployedMessage from "./devbox/devbox-deployment-message";

import ClusterMessage from "./cluster/cluster-message";

import LaunchpadMessage from "./launchpad/launchpad-message";

import ObjectStorageMessage from "./objectstorage/objectstorage-message";

export const SystemMessageType = {
  devbox: {
    detail: (target: CustomResourceTarget) => <DevboxMessage target={target} />,
    deployment: (target: CustomResourceTarget) => (
      <DevboxDeployedMessage target={target} />
    ),
  },
  cluster: {
    detail: (target: CustomResourceTarget) => (
      <ClusterMessage target={target} />
    ),
  },
  launchpad: {
    detail: (target: BuiltinResourceTarget) => (
      <LaunchpadMessage target={target} />
    ),
  },
  objectstorage: {
    detail: (target: CustomResourceTarget) => (
      <ObjectStorageMessage target={target} />
    ),
  },
};
