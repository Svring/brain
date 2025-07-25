import ClusterNode from "./cluster/cluster-node";
import DeployNode from "./deploy/deploy-node";
import DevboxNode from "./devbox/devbox-node";
import IngressNode from "./ingress/ingress-node";
import ObjectStorageNode from "./objectstorage/objectstorage-node";
import PersistentVolumeNode from "./persistent-volume/persistent-volume-node";
import ServiceNode from "./service/service-node";
import StatefulSetNode from "./statefulset/statefulset-node";
import { NodeTypes } from "@xyflow/react";

const nodeTypes: NodeTypes = {
  devbox: DevboxNode,
  cluster: ClusterNode,
  deployment: DeployNode,
  ingress: IngressNode,
  objectstoragebucket: ObjectStorageNode,
  pvc: PersistentVolumeNode,
  service: ServiceNode,
  statefulset: StatefulSetNode,
};

export default nodeTypes;
