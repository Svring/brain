import ClusterNode from "./sealos/cluster/cluster-node";
import ConfigmapNode from "./sealos/configmap/configmap-node";
import CronjobNode from "./sealos/cronjob/cronjob-node";
import DeploymentNode from "./sealos/deployment/deployment-node";
import DevboxNode from "./sealos/devbox/devbox-node";
import DevGroupNode from "./brain/group/dev-group";
import IngressNode from "./sealos/ingress/ingress-node";
import JobNode from "./sealos/job/job-node";
import ObjectStorageNode from "./sealos/objectstorage/objectstorage-node";
import PvcNode from "./sealos/pvc/pvc-node";
import ServiceNode from "./sealos/service/service-node";
import StatefulsetNode from "./sealos/statefulset/statefulset-node";
import NetworkNode from "./brain/network/network-node";
import { NodeTypes } from "@xyflow/react";

const nodeTypes: NodeTypes = {
  devbox: DevboxNode,
  cluster: ClusterNode,
  configmap: ConfigmapNode,
  cronjob: CronjobNode,
  deployment: DeploymentNode,
  devgroup: DevGroupNode,
  ingress: IngressNode,
  job: JobNode,
  objectstoragebucket: ObjectStorageNode,
  pvc: PvcNode,
  service: ServiceNode,
  statefulset: StatefulsetNode,
  network: NetworkNode,
};

export default nodeTypes;
