import ClusterNode from "./sealos/cluster/cluster-node";
import DeploymentNode from "./sealos/deployment/deployment-node";
import DevboxNode from "./sealos/devbox/devbox-node";
import IngressNode from "./sealos/ingress/ingress-node";
import ObjectStorageNode from "./sealos/objectstorage/objectstorage-node";
import StatefulSetNode from "./sealos/statefulset/statefulset-node";
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
