// "use client";

// import { queryOptions } from "@tanstack/react-query";
// import { runParallelAction } from "next-server-actions-parallel";
// import {
//   getBuiltinResource,
//   getCustomResource,
//   listBuiltinResources,
//   listCustomResources,
// } from "./k8s-api";
// import { RESOURCES } from "./k8s-constant";
// import type {
//   BuiltinResourceTypeTarget,
//   CustomResourceTypeTarget,
//   GetBuiltinResourceRequest,
//   GetCustomResourceRequest,
//   K8sApiContext,
//   ListAllResourcesRequest,
//   ResourceTarget,
//   ResourceTypeTarget,
// } from "./schemas";

// const listCustomResourceOptions = (
//   resource: CustomResourceTypeTarget,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) =>
//   queryOptions({
//     queryKey: [
//       "k8s",
//       "custom-resources",
//       "list",
//       resource.group,
//       resource.version,
//       context.namespace,
//       resource.plural,
//       resource.labelSelector,
//     ],
//     queryFn: async () => {
//       const result = await runParallelAction(
//         listCustomResources(
//           context.kubeconfig,
//           resource.group,
//           resource.version,
//           context.namespace,
//           resource.plural,
//           resource.labelSelector
//         )
//       );
//       return result;
//     },
//     select: (data) => postprocess?.(data) ?? data,
//     enabled:
//       !!resource.group &&
//       !!resource.version &&
//       !!context.namespace &&
//       !!resource.plural,
//   });

// const getCustomResourceOptions = (
//   request: GetCustomResourceRequest,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) =>
//   queryOptions({
//     queryKey: [
//       "k8s",
//       "custom-resource",
//       "get",
//       request.group,
//       request.version,
//       context.namespace,
//       request.plural,
//       request.name,
//     ],
//     queryFn: async () => {
//       const result = await runParallelAction(
//         getCustomResource(
//           context.kubeconfig,
//           request.group,
//           request.version,
//           context.namespace,
//           request.plural,
//           request.name
//         )
//       );
//       return result;
//     },
//     select: (data) => postprocess?.(data) ?? data,
//     enabled:
//       !!request.group &&
//       !!request.version &&
//       !!context.namespace &&
//       !!request.plural &&
//       !!request.name,
//   });

// const listBuiltinResourceOptions = (
//   resource: BuiltinResourceTypeTarget,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) =>
//   queryOptions({
//     queryKey: [
//       "k8s",
//       "builtin-resources",
//       "list",
//       resource.type,
//       context.namespace,
//       resource.labelSelector,
//     ],
//     queryFn: async () => {
//       const result = await runParallelAction(
//         listBuiltinResources(
//           context.kubeconfig,
//           context.namespace,
//           resource.type,
//           resource.labelSelector
//         )
//       );
//       return result;
//     },
//     select: (data) => postprocess?.(data) ?? data,
//     enabled: !!resource.type && !!context.namespace,
//   });

// const getBuiltinResourceOptions = (
//   request: GetBuiltinResourceRequest,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) =>
//   queryOptions({
//     queryKey: [
//       "k8s",
//       "builtin-resource",
//       "get",
//       request.resourceType,
//       context.namespace,
//       request.name,
//     ],
//     queryFn: async () => {
//       const result = await runParallelAction(
//         getBuiltinResource(
//           context.kubeconfig,
//           context.namespace,
//           request.resourceType,
//           request.name
//         )
//       );
//       return result;
//     },
//     select: (data) => postprocess?.(data) ?? data,
//     enabled: !!request.resourceType && !!context.namespace && !!request.name,
//   });

// export const getResourceOptions = (
//   resource: ResourceTarget,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) => {
//   if (resource.type === "custom") {
//     return getCustomResourceOptions(
//       {
//         group: resource.group,
//         version: resource.version,
//         plural: resource.plural,
//         name: resource.name,
//       },
//       context,
//       postprocess ?? ((d) => d)
//     );
//   }

//   return getBuiltinResourceOptions(
//     {
//       resourceType: resource.type,
//       name: resource.name,
//     },
//     context,
//     postprocess ?? ((d) => d)
//   );
// };

// export const listResourcesOptions = (
//   resource: ResourceTypeTarget,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) => {
//   if (resource.type === "custom") {
//     return listCustomResourceOptions(
//       {
//         type: "custom",
//         group: resource.group,
//         version: resource.version,
//         namespace: resource.namespace,
//         plural: resource.plural,
//         labelSelector: resource.labelSelector,
//       },
//       context,
//       postprocess ?? ((d) => d)
//     );
//   }

//   // Builtin resource list
//   return listBuiltinResourceOptions(
//     {
//       type: resource.type,
//       namespace: resource.namespace,
//       labelSelector: resource.labelSelector,
//     },
//     context,
//     postprocess ?? ((d) => d)
//   );
// };

// export const listAllResourcesOptions = (
//   request: ListAllResourcesRequest,
//   context: K8sApiContext,
//   postprocess?: (data: unknown) => unknown
// ) =>
//   queryOptions({
//     queryKey: [
//       "k8s",
//       "all-resources",
//       "list",
//       context.namespace,
//       request.labelSelector,
//     ],
//     queryFn: async () => {
//       const resourcePromises = Object.entries(RESOURCES).map(([_, config]) => {
//         if (config.type === "custom") {
//           return runParallelAction(
//             listCustomResources(
//               context.kubeconfig,
//               config.group,
//               config.version,
//               context.namespace,
//               config.plural,
//               request.labelSelector
//             )
//           );
//         }
//         // All resources are now either custom or builtin
//         return runParallelAction(
//           listBuiltinResources(
//             context.kubeconfig,
//             context.namespace,
//             config.resourceType,
//             request.labelSelector
//           )
//         );
//       });

//       const results = await Promise.all(resourcePromises);
//       return Object.fromEntries(
//         Object.keys(RESOURCES).map((name, i) => [name, results[i]])
//       );
//     },
//     select: postprocess ?? ((d) => d),
//     enabled: !!context.namespace,
//   });
