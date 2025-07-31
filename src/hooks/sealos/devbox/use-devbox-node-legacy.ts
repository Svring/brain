// "use client";

// import { useQueries } from "@tanstack/react-query";
// import {
//   listAllResourcesOptions,
//   getCustomResourceOptions,
//   getPodsByResourceTargetOptions,
//   getSecretsByResourceTargetOptions,
// } from "@/lib/k8s/k8s-method/k8s-query";
// import _ from "lodash";
// import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
// import { DEVBOX_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
// import { flattenResourceList } from "@/lib/k8s/k8s-method/k8s-utils";
// import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/context-schemas";
// import {
//   DevboxResourceK8sSchema,
//   DevboxPodSchema,
//   DevboxSecretSchema,
//   DevboxIngressSchema,
// } from "@/lib/sealos/devbox/schemas/devbox-k8s-schemas";
// import { convertDevboxK8sToNodeData } from "@/lib/sealos/devbox/devbox-utils";

// const useDevboxNode = (
//   context: K8sApiContext,
//   target: CustomResourceTarget
// ) => {
//   const devboxLabel = `${DEVBOX_RELATE_RESOURCE_LABELS.DEVBOX_MANAGER}=${target.name}`;

//   const queries = useQueries({
//     queries: [
//       {
//         ...getCustomResourceOptions(context, target),
//         select: (data: any) => DevboxResourceK8sSchema.parse(data),
//       },
//       {
//         ...getPodsByResourceTargetOptions(context, target),
//         select: (data: any) =>
//           _.map(flattenResourceList(data), (item) =>
//             DevboxPodSchema.parse(item)
//           ),
//       },
//       {
//         ...getSecretsByResourceTargetOptions(context, target),
//         select: (data: any) =>
//           DevboxSecretSchema.parse(_.first(flattenResourceList(data))),
//       },
//       {
//         ...listResourcesByLabelOptions(context, devboxLabel, ["ingress"], []),
//         select: (data: any) =>
//           _.map(flattenResourceList(_.get(data, "builtin.ingress")), (item) =>
//             DevboxIngressSchema.parse(item)
//           ),
//       },
//     ],
//   });

//   const [resourceQuery, podsQuery, secretsQuery, ingressQuery] = queries;

//   const isLoading = queries.some((query) => query.isLoading);
//   const resourceData = resourceQuery.data;
//   const podsData = podsQuery.data;
//   const secretsData = secretsQuery.data;
//   const ingressData = ingressQuery.data;

//   if (isLoading || !resourceData) {
//     return {
//       data: undefined,
//       isLoading: true,
//     };
//   }

//   const nodeData = convertDevboxK8sToNodeData(
//     resourceData,
//     podsData,
//     secretsData,
//     ingressData
//   );

//   return {
//     nodeData,
//     isLoading,
//   };
// };

// export default useDevboxNode;
