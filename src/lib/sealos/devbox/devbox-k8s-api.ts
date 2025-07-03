"use client";

import { listIngressesOptions, listServicesOptions } from "@/lib/k8s/k8s-query";
import { DEVBOX_MANAGER_LABEL } from "./devbox-constant";

/**
 * Query options for listing services associated with a devbox.
 * @param namespace - The namespace to list services in.
 * @param devboxName - The name of the devbox to filter services for.
 * @param postprocess - Optional function to transform the data.
 * @returns Query options for listing devbox services.
 */
export const listDevboxServicesOptions = (
  namespace: string,
  devboxName: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  listServicesOptions(
    {
      namespace,
      labelSelector: `${DEVBOX_MANAGER_LABEL}=${devboxName}`,
    },
    postprocess
  );

/**
 * Query options for listing ingresses associated with a devbox.
 * @param namespace - The namespace to list ingresses in.
 * @param devboxName - The name of the devbox to filter ingresses for.
 * @param postprocess - Optional function to transform the data.
 * @returns Query options for listing devbox ingresses.
 */
export const listDevboxIngressesOptions = (
  namespace: string,
  devboxName: string,
  postprocess: (data: unknown) => unknown = (d) => d
) =>
  listIngressesOptions(
    {
      namespace,
      labelSelector: `${DEVBOX_MANAGER_LABEL}=${devboxName}`,
    },
    postprocess
  );
