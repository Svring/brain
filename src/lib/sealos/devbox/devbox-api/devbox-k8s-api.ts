// "use client";

// import { listResourcesOptions } from "@/lib/k8s/k8s-query";
// import type { K8sApiContext, ResourceTarget, ResourceTypeTarget } from "@/lib/k8s/schemas";

// /**
//  * Query options for listing services associated with a devbox.
//  * @param context - k8s API context containing namespace and kubeconfig.
//  * @param devboxName - The name of the devbox to filter services for.
//  * @param postprocess - Optional function to transform the data.
//  */
// export const listDevboxServicesOptions = (
//   resource: ResourceTarget,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) => {
//   return listResourcesOptions(resource, context, postprocess);
// };

// /**
//  * Query options for listing ingresses associated with a devbox.
//  * @param context - k8s API context containing namespace and kubeconfig.
//  * @param devboxName - The name of the devbox to filter ingresses for.
//  * @param postprocess - Optional function to transform the data.
//  */
// export const listDevboxIngressesOptions = (
//   resource: ResourceTarget,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) => {
//   resource.labelSelector = `devbox=${resource.name}`;
//   return listResourcesOptions(resource, context, postprocess);
// };
