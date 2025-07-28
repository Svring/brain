// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   useCreateDevboxMutation,
//   useManageDevboxLifecycleMutation,
//   useDeleteDevboxMutation,
//   useReleaseDevboxMutation,
//   useDeployDevboxMutation,
//   useCreateDevboxPortMutation,
//   useRemoveDevboxPortMutation,
//   useCreateAppMutation,
//   useDeleteAppMutation,
// } from "../devbox-method/devbox-mutation";
// import { generateDevboxName } from "../devbox-utils";
// import type {
//   DevboxApiContext,
//   DevboxCreateRequest,
//   DevboxLifecycleRequest,
//   DevboxReleaseRequest,
//   DevboxDeployRequest,
//   DevboxPortCreateRequest,
//   AppFormConfig,
//   RuntimeName,
// } from "../schemas";

// // Partial request types for easier usage
// export type PartialDevboxCreateRequest = Partial<DevboxCreateRequest> & {
//   runtimeName: RuntimeName; // Required field
// };

// export type PartialDevboxLifecycleRequest = Partial<DevboxLifecycleRequest> & {
//   devboxName: string; // Required field
// };

// export type PartialDevboxReleaseRequest = Partial<DevboxReleaseRequest> & {
//   devboxName: string; // Required field
// };

// export type PartialDevboxDeployRequest = Partial<DevboxDeployRequest> & {
//   devboxName: string; // Required field
// };

// export type PartialDevboxPortCreateRequest =
//   Partial<DevboxPortCreateRequest> & {
//     devboxName: string; // Required field
//     port: number; // Required field
//   };

// export type PartialAppFormConfig = Partial<AppFormConfig> & {
//   name: string; // Required field
// };

// /**
//  * Custom hook for creating devboxes with default values
//  */
// export function useCreateDevboxAction(context: DevboxApiContext) {
//   const baseMutation = useCreateDevboxMutation(context);

//   return useMutation({
//     mutationFn: async (partialRequest: PartialDevboxCreateRequest) => {
//       // Apply defaults to the partial request
//       const fullRequest: DevboxCreateRequest = {
//         name: partialRequest.name || generateDevboxName(),
//         cpu: partialRequest.cpu ?? 2000,
//         memory: partialRequest.memory ?? 4096,
//         runtimeName: partialRequest.runtimeName,
//       };

//       console.log(fullRequest);

//       // Use the base mutation function
//       return baseMutation.mutateAsync(fullRequest);
//     },
//   });
// }

// /**
//  * Custom hook for managing devbox lifecycle with default values
//  */
// export function useManageDevboxLifecycleAction(context: DevboxApiContext) {
//   const baseMutation = useManageDevboxLifecycleMutation(context);

//   return useMutation({
//     mutationFn: async (partialRequest: PartialDevboxLifecycleRequest) => {
//       const fullRequest: DevboxLifecycleRequest = {
//         action: partialRequest.action || "start",
//         ...partialRequest,
//       };

//       return baseMutation.mutateAsync(fullRequest);
//     },
//   });
// }

// /**
//  * Simple action for deleting a devbox
//  */
// export function useDeleteDevboxAction(context: DevboxApiContext) {
//   const baseMutation = useDeleteDevboxMutation(context);

//   return useMutation({
//     mutationFn: (devboxName: string) => baseMutation.mutateAsync(devboxName),
//   });
// }

// /**
//  * Custom hook for releasing devbox with minimal parameters
//  */
// export function useReleaseDevboxAction(context: DevboxApiContext) {
//   const baseMutation = useReleaseDevboxMutation(context);

//   return useMutation({
//     mutationFn: async (partialRequest: PartialDevboxReleaseRequest) => {
//       const fullRequest: DevboxReleaseRequest = {
//         devboxName: partialRequest.devboxName,
//         tag: partialRequest.tag || "latest",
//         releaseDes: partialRequest.releaseDes ?? "",
//       };

//       return baseMutation.mutateAsync(fullRequest);
//     },
//   });
// }

// /**
//  * Custom hook for deploying devbox with minimal parameters
//  */
// export function useDeployDevboxAction(context: DevboxApiContext) {
//   const baseMutation = useDeployDevboxMutation(context);

//   return useMutation({
//     mutationFn: async (partialRequest: PartialDevboxDeployRequest) => {
//       const fullRequest: DevboxDeployRequest = {
//         devboxName: partialRequest.devboxName,
//         tag: partialRequest.tag || "latest",
//         cpu: partialRequest.cpu ?? 2000,
//         memory: partialRequest.memory ?? 4096,
//         port: partialRequest.port,
//       };

//       return baseMutation.mutateAsync(fullRequest);
//     },
//   });
// }

// /**
//  * Custom hook for creating devbox port with minimal parameters
//  */
// export function useCreateDevboxPortAction(context: DevboxApiContext) {
//   const baseMutation = useCreateDevboxPortMutation(context);

//   return useMutation({
//     mutationFn: async (partialRequest: PartialDevboxPortCreateRequest) => {
//       const fullRequest: DevboxPortCreateRequest = {
//         devboxName: partialRequest.devboxName,
//         port: partialRequest.port,
//         protocol: partialRequest.protocol ?? "HTTP",
//       };

//       return baseMutation.mutateAsync(fullRequest);
//     },
//   });
// }

// /**
//  * Simple action for removing a devbox port
//  */
// export function useRemoveDevboxPortAction(context: DevboxApiContext) {
//   const baseMutation = useRemoveDevboxPortMutation(context);

//   return useMutation({
//     mutationFn: ({ devboxName, port }: { devboxName: string; port: number }) =>
//       baseMutation.mutateAsync({ devboxName, port }),
//   });
// }

// /**
//  * Simple action for deleting an app
//  */
// export function useDeleteAppAction(context: DevboxApiContext) {
//   const baseMutation = useDeleteAppMutation(context);

//   return useMutation({
//     mutationFn: (appName: string) => baseMutation.mutateAsync(appName),
//   });
// }
