import DatabaseNode from "./database/detabase-node";
import DeployNode from "./deploy/deploy-node";
import DevboxNode from "./devbox/devbox-node";
import IngressNode from "./ingress/ingress-node";
import ObjectStorageNode from "./object-storage/object-storage-node";
import PersistentVolumeNode from "./persistent-volume/persistent-volume-node";
import ServiceNode from "./service/service-node";
import StatefulSetNode from "./statefulset/statefulset-node";

const nodeTypes = {
  devbox: DevboxNode,
  database: DatabaseNode,
  deploy: DeployNode,
  ingress: IngressNode,
  objectStorage: ObjectStorageNode,
  persistentVolume: PersistentVolumeNode,
  service: ServiceNode,
  statefulSet: StatefulSetNode,
};

export default nodeTypes;
