"use client";

import { assign, createMachine } from "xstate";
import { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export type Page = "home" | "project-overview" | "project-detail";

// Resource view definitions based on message component sections
export type DevboxView = "main" | "resource" | "ssh" | "network" | "release";
export type ClusterView = "main" | "resource" | "connect" | "backup";
export type LaunchpadView =
  | "main"
  | "basic-info"
  | "resource"
  | "deployment"
  | "network"
  | "advanced-config";

// Union type for all possible resource views
export type ResourceView = DevboxView | ClusterView | LaunchpadView;

// Resource view mapping by resource type
export interface ResourceViewMap {
  devbox: DevboxView;
  cluster: ClusterView;
  deployment: LaunchpadView;
  statefulset: LaunchpadView;
  // Add more resource types as needed
}

// Helper function to get available views for a resource type
export function getAvailableViewsForResourceType(
  resourceType: string
): ResourceView[] {
  switch (resourceType.toLowerCase()) {
    case "devbox":
      return ["main", "resource", "ssh", "network", "release"];
    case "cluster":
      return ["main", "resource", "connect", "backup"];
    case "deployment":
    case "statefulset":
      return [
        "main",
        "basic-info",
        "resource",
        "deployment",
        "network",
        "advanced-config",
      ];
    default:
      return ["main"];
  }
}

export interface NavigationContext {
  currentPage: Page;
  selectedProject: string | null;
  // Currently selected resource in project-detail state
  selectedResource: ResourceTarget | null;
  // Current active view for the selected resource
  activeView: ResourceView | null;
}

export type NavigationEvent =
  // Page navigation
  | { type: "GO_HOME" }
  | { type: "GO_PROJECT_OVERVIEW" }
  | { type: "GO_PROJECT_DETAIL"; projectName: string }

  // Resource navigation within project-detail
  | { type: "SELECT_RESOURCE"; resourceTarget: ResourceTarget }
  | { type: "CHANGE_VIEW"; view: ResourceView }
  | { type: "CLOSE_RESOURCE" }

  // Project selection
  | { type: "SET_SELECTED_PROJECT"; projectName: string | null };

export const navigationMachine = createMachine({
  /**
   * XState v5 type annotations for context and events
   */
  types: {} as { context: NavigationContext; events: NavigationEvent },
  id: "navigation",
  initial: "project-detail",
  context: {
    currentPage: "project-detail",
    selectedProject: null,
    selectedResource: null,
    activeView: null,
  },
  states: {
    home: {
      on: {
        GO_PROJECT_OVERVIEW: {
          target: "project-overview",
          actions: assign({ currentPage: "project-overview" }),
        },
        GO_PROJECT_DETAIL: {
          target: "project-detail",
          actions: assign({
            currentPage: "project-detail",
            selectedProject: ({ event }) => event.projectName,
          }),
        },
      },
    },
    "project-overview": {
      on: {
        GO_HOME: {
          target: "home",
          actions: assign({ currentPage: "home" }),
        },
        GO_PROJECT_DETAIL: {
          target: "project-detail",
          actions: assign({
            currentPage: "project-detail",
            selectedProject: ({ event }) => event.projectName,
          }),
        },
      },
    },
    "project-detail": {
      on: {
        GO_HOME: {
          target: "home",
          actions: assign({
            currentPage: "home",
            selectedResource: null,
            activeView: null,
          }),
        },
        GO_PROJECT_OVERVIEW: {
          target: "project-overview",
          actions: assign({
            currentPage: "project-overview",
            selectedResource: null,
            activeView: null,
          }),
        },
        SELECT_RESOURCE: {
          actions: assign({
            selectedResource: ({ event }) => event.resourceTarget,
            activeView: () => "main", // Always start with main view
          }),
        },
        CHANGE_VIEW: {
          actions: assign({
            activeView: ({ event }) => event.view,
          }),
        },
        CLOSE_RESOURCE: {
          actions: assign({
            selectedResource: () => null,
            activeView: () => null,
          }),
        },
      },
    },
  },
  on: {
    // Global events that work in any state
    SET_SELECTED_PROJECT: {
      actions: assign({ selectedProject: ({ event }) => event.projectName }),
    },
  },
});
