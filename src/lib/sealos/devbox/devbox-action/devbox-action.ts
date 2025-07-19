"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCreateDevboxMutation,
  useManageDevboxLifecycleMutation,
  useDeleteDevboxMutation,
  useReleaseDevboxMutation,
  useDeployDevboxMutation,
  useCreateDevboxPortMutation,
  useRemoveDevboxPortMutation,
  useCreateAppMutation,
  useDeleteAppMutation,
} from "../devbox-method/devbox-mutation";
import {
  listDevboxOptions,
  getDevboxOptions,
  getDevboxReleasesOptions,
  listAppsOptions,
  getAppOptions,
  getAppPodsOptions,
} from "../devbox-method/devbox-query";
import { generateDevboxName } from "../devbox-utils";
import type {
  DevboxApiContext,
  DevboxCreateRequest,
  DevboxLifecycleRequest,
  DevboxReleaseRequest,
  DevboxDeployRequest,
  DevboxPortCreateRequest,
  AppFormConfig,
  RuntimeName,
} from "../schemas";

// Partial request types for easier usage
export type PartialDevboxCreateRequest = Partial<DevboxCreateRequest> & {
  runtimeName: RuntimeName; // Required field
};

export type PartialDevboxLifecycleRequest = Partial<DevboxLifecycleRequest> & {
  devboxName: string; // Required field
};

export type PartialDevboxReleaseRequest = Partial<DevboxReleaseRequest> & {
  devboxName: string; // Required field
};

export type PartialDevboxDeployRequest = Partial<DevboxDeployRequest> & {
  devboxName: string; // Required field
};

export type PartialDevboxPortCreateRequest =
  Partial<DevboxPortCreateRequest> & {
    devboxName: string; // Required field
    port: number; // Required field
  };

export type PartialAppFormConfig = Partial<AppFormConfig> & {
  name: string; // Required field
};

/**
 * Custom hook for creating devboxes with default values
 */
export function useCreateDevboxAction(context: DevboxApiContext) {
  const baseMutation = useCreateDevboxMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialDevboxCreateRequest) => {
      // Apply defaults to the partial request
      const fullRequest: DevboxCreateRequest = {
        name: partialRequest.name || generateDevboxName(),
        cpu: partialRequest.cpu ?? 2000,
        memory: partialRequest.memory ?? 4096,
        runtimeName: partialRequest.runtimeName,
      };

      // Use the base mutation function
      return baseMutation.mutateAsync(fullRequest);
    },
  });
}

/**
 * Custom hook for managing devbox lifecycle with default values
 */
export function useManageDevboxLifecycleAction(context: DevboxApiContext) {
  const baseMutation = useManageDevboxLifecycleMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialDevboxLifecycleRequest) => {
      const fullRequest: DevboxLifecycleRequest = {
        action: partialRequest.action || "start",
        ...partialRequest,
      };

      return baseMutation.mutateAsync(fullRequest);
    },
  });
}

/**
 * Simple action for deleting a devbox
 */
export function useDeleteDevboxAction(context: DevboxApiContext) {
  const baseMutation = useDeleteDevboxMutation(context);

  return useMutation({
    mutationFn: (devboxName: string) => baseMutation.mutateAsync(devboxName),
  });
}

/**
 * Custom hook for releasing devbox with minimal parameters
 */
export function useReleaseDevboxAction(context: DevboxApiContext) {
  const baseMutation = useReleaseDevboxMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialDevboxReleaseRequest) => {
      const fullRequest: DevboxReleaseRequest = {
        devboxName: partialRequest.devboxName,
        tag: partialRequest.tag || "latest",
        releaseDes: partialRequest.releaseDes ?? "",
      };

      return baseMutation.mutateAsync(fullRequest);
    },
  });
}

/**
 * Custom hook for deploying devbox with minimal parameters
 */
export function useDeployDevboxAction(context: DevboxApiContext) {
  const baseMutation = useDeployDevboxMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialDevboxDeployRequest) => {
      const fullRequest: DevboxDeployRequest = {
        devboxName: partialRequest.devboxName,
        tag: partialRequest.tag || "latest",
        cpu: partialRequest.cpu ?? 2000,
        memory: partialRequest.memory ?? 4096,
        port: partialRequest.port,
      };

      return baseMutation.mutateAsync(fullRequest);
    },
  });
}

/**
 * Custom hook for creating devbox port with minimal parameters
 */
export function useCreateDevboxPortAction(context: DevboxApiContext) {
  const baseMutation = useCreateDevboxPortMutation(context);

  return useMutation({
    mutationFn: async (partialRequest: PartialDevboxPortCreateRequest) => {
      const fullRequest: DevboxPortCreateRequest = {
        devboxName: partialRequest.devboxName,
        port: partialRequest.port,
        protocol: partialRequest.protocol ?? "HTTP",
      };

      return baseMutation.mutateAsync(fullRequest);
    },
  });
}

/**
 * Simple action for removing a devbox port
 */
export function useRemoveDevboxPortAction(context: DevboxApiContext) {
  const baseMutation = useRemoveDevboxPortMutation(context);

  return useMutation({
    mutationFn: ({ devboxName, port }: { devboxName: string; port: number }) =>
      baseMutation.mutateAsync({ devboxName, port }),
  });
}

/**
 * Custom hook for creating app with minimal parameters
 */
// export function useCreateAppAction(context: DevboxApiContext) {
//   const baseMutation = useCreateAppMutation(context);

//   return useMutation({
//     mutationFn: async (partialConfig: PartialAppFormConfig) => {
//       const fullConfig: AppFormConfig = {
//         name: partialConfig.name,
//         cpu: partialConfig.cpu ?? 1000,
//         memory: partialConfig.memory ?? 1024,
//         replicas: partialConfig.replicas ?? 1,
//         appName: partialConfig.appName ?? partialConfig.name,
//         imageName: partialConfig.imageName ?? "",
//         runCMD: partialConfig.runCMD ?? "",
//         cmdParam: partialConfig.cmdParam ?? "",
//         networks: partialConfig.networks ?? [],
//         envs: partialConfig.envs ?? [],
//         hpa: partialConfig.hpa,
//         configMapList: partialConfig.configMapList ?? [],
//         secretList: partialConfig.secretList ?? [],
//         storeList: partialConfig.storeList ?? [],
//         gpu: partialConfig.gpu,
//       };

//       return baseMutation.mutateAsync(fullConfig);
//     },
//   });
// }

/**
 * Simple action for deleting an app
 */
export function useDeleteAppAction(context: DevboxApiContext) {
  const baseMutation = useDeleteAppMutation(context);

  return useMutation({
    mutationFn: (appName: string) => baseMutation.mutateAsync(appName),
  });
}

// Query Actions - Higher level abstractions for query functions

/**
 * Action for listing devboxes with optional postprocessing
 */
export function useListDevboxesAction(
  context: DevboxApiContext,
  postprocess?: (data: any) => unknown
) {
  return useQuery(listDevboxOptions(context, postprocess));
}

/**
 * Action for getting a specific devbox
 */
export function useGetDevboxAction(
  devboxName: string,
  context: DevboxApiContext,
  postprocess?: (data: any) => unknown
) {
  return useQuery(getDevboxOptions(devboxName, context, postprocess));
}

/**
 * Action for getting devbox releases
 */
export function useGetDevboxReleasesAction(
  devboxName: string,
  context: DevboxApiContext,
  postprocess?: (data: any) => unknown
) {
  return useQuery(getDevboxReleasesOptions(devboxName, context, postprocess));
}

/**
 * Action for listing apps with optional postprocessing
 */
export function useListAppsAction(
  context: DevboxApiContext,
  postprocess?: (data: any) => unknown
) {
  return useQuery(listAppsOptions(context, postprocess));
}

/**
 * Action for getting a specific app
 */
export function useGetAppAction(
  appName: string,
  context: DevboxApiContext,
  postprocess?: (data: any) => unknown
) {
  return useQuery(getAppOptions(appName, context, postprocess));
}

/**
 * Action for getting app pods
 */
export function useGetAppPodsAction(
  appName: string,
  context: DevboxApiContext,
  postprocess?: (data: any) => unknown
) {
  return useQuery(getAppPodsOptions(appName, context, postprocess));
}
