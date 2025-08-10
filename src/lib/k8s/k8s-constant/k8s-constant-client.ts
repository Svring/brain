import {
  AppsV1Api,
  AutoscalingV2Api,
  BatchV1Api,
  CoreV1Api,
  CustomObjectsApi,
  NetworkingV1Api,
  RbacAuthorizationV1Api,
} from "@kubernetes/client-node";

export type K8sApiClients = {
  customApi: CustomObjectsApi;
  appsApi: AppsV1Api;
  autoscalingApi: AutoscalingV2Api;
  batchApi: BatchV1Api;
  coreApi: CoreV1Api;
  networkingApi: NetworkingV1Api;
  rbacApi: RbacAuthorizationV1Api;
};
