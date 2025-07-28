import ClusterNode from "./cluster/cluster-node";
import DeploymentNode from "./deployment/deployment-node";
import DevboxNode from "./devbox/devbox-node";
import IngressNode from "./ingress/ingress-node";
import ObjectStorageNode from "./objectstorage/objectstorage-node";
import StatefulSetNode from "./statefulset/statefulset-node";
import { NodeTypes } from "@xyflow/react";

const nodeTypes: NodeTypes = {
  devbox: DevboxNode,
  cluster: ClusterNode,
  deployment: DeploymentNode,
  ingress: IngressNode,
  objectstoragebucket: ObjectStorageNode,
  statefulset: StatefulSetNode,
};

export default nodeTypes;
