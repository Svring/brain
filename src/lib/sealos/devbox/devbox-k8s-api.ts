// "use client";

// import { listResourcesOptions } from "@/lib/k8s/k8s-query";
// import type { K8sApiContext } from "@/lib/k8s/schemas";

// /**
//  * Query options for listing services associated with a devbox.
//  * @param context - k8s API context containing namespace and kubeconfig.
//  * @param devboxName - The name of the devbox to filter services for.
//  * @param postprocess - Optional function to transform the data.
//  */
// export const listDevboxServicesOptions = (
//   context: K8sApiContext,
//   devboxName: string,
//   postprocess?: (data: unknown) => unknown
// ) =>
//   listResourcesOptions(
//     { type: "service", namespace: context.namespace },
//     context,
//     postprocess
//   );

// /**
//  * Query options for listing ingresses associated with a devbox.
//  * @param context - k8s API context containing namespace and kubeconfig.
//  * @param devboxName - The name of the devbox to filter ingresses for.
//  * @param postprocess - Optional function to transform the data.
//  */
// export const listDevboxIngressesOptions = (
//   context: K8sApiContext,
//   devboxName: string,
//   postprocess?: (data: unknown) => unknown
// ) =>
//   listResourcesOptions(
//     { type: "ingress", namespace: context.namespace },
//     context,
//     postprocess
//   );
