"use client";

import { assign, createMachine } from "xstate";
import type { EnvVar } from "@/lib/k8s/k8s-method/k8s-utils";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export interface ResourceObject {
  name: string;
  kind: string;
  image?: string;
  env?: EnvVar[];
  ports?: Array<{
    number: number;
    name?: string;
    nodePort?: number;
    protocol?: string;
    serviceName?: string;
    privateAddress?: string;
    publicAddress?: string;
    ingressName?: string;
    host?: string;
  }>;
  [key: string]: any;
}

export interface ProjectContextState {
  allProjects: unknown[];
  selectedProject: string | null;
  selectedProjectResources: ResourceObject[] | null;
  selectedResource: ResourceTarget | null;
}

export type ProjectEvent =
  | { type: "SET_ALL_PROJECTS"; projects: unknown[] }
  | { type: "SELECT_PROJECT"; project: unknown }
  | { type: "CLEAR_SELECTED_PROJECT" }
  | { type: "SET_SELECTED_PROJECT_RESOURCES"; resources: ResourceObject[] }
  | { type: "CLEAR_SELECTED_PROJECT_RESOURCES" }
  | { type: "UPDATE_RESOURCE"; resource: ResourceObject }
  | { type: "REMOVE_RESOURCE"; name: string; kind: string }
  | { type: "SELECT_RESOURCE"; target: ResourceTarget }
  | { type: "CLEAR_SELECTED_RESOURCE" };

export const projectMachine = createMachine({
  /** XState v5 generics */
  types: {} as { context: ProjectContextState; events: ProjectEvent },
  id: "project",
  initial: "idle",
  context: {
    allProjects: [],
    selectedProject: null,
    selectedProjectResources: [],
    selectedResource: null,
  },
  states: {
    idle: {},
  },
  on: {
    SET_ALL_PROJECTS: {
      actions: assign({ allProjects: ({ event }) => event.projects }),
    },
    SELECT_PROJECT: {
      actions: assign({
        selectedProject: ({ event }) => event.project as string,
      }),
    },
    CLEAR_SELECTED_PROJECT: {
      actions: assign({ selectedProject: () => null }),
    },
    SET_SELECTED_PROJECT_RESOURCES: {
      actions: assign({
        selectedProjectResources: ({ event }) => event.resources,
      }),
    },
    CLEAR_SELECTED_PROJECT_RESOURCES: {
      actions: assign({ selectedProjectResources: () => [] }),
    },
    UPDATE_RESOURCE: {
      actions: assign({
        selectedProjectResources: ({ context, event }) => {
          const existingIndex =
            context.selectedProjectResources?.findIndex(
              (resource) =>
                resource.name === event.resource.name &&
                resource.kind === event.resource.kind
            ) ?? -1;

          if (existingIndex >= 0) {
            // Check if the resource actually changed before updating
            const existing = context.selectedProjectResources?.[existingIndex];
            if (JSON.stringify(existing) === JSON.stringify(event.resource)) {
              return context.selectedProjectResources; // No change, return the same array
            }

            // Update existing resource
            const updated = [...(context.selectedProjectResources || [])];
            updated[existingIndex] = event.resource;
            return updated;
          } else {
            // Add new resource
            return [
              ...(context.selectedProjectResources || []),
              event.resource,
            ];
          }
        },
      }),
    },
    REMOVE_RESOURCE: {
      actions: assign({
        selectedProjectResources: ({ context, event }) =>
          context.selectedProjectResources?.filter(
            (resource) =>
              !(resource.name === event.name && resource.kind === event.kind)
          ) || [],
      }),
    },
    SELECT_RESOURCE: {
      actions: assign({
        selectedResource: ({ event }) => event.target,
      }),
    },
    CLEAR_SELECTED_RESOURCE: {
      actions: assign({ selectedResource: () => null }),
    },
  },
});
