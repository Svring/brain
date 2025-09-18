import { SearchAppStoreActionMessage } from "@/components/copilot/langgraph/search-app-store-action-message";
import { SearchDockerHubActionMessage } from "@/components/copilot/langgraph/search-docker-hub-action-message";
import { SearchWebActionMessage } from "@/components/copilot/langgraph/search-web-action-message";
import { ProposeTemplateDeploymentMessage } from "@/components/copilot/langgraph/propose-template-deployment-message";
import { ProposeDevenvDeploymentMessage } from "@/components/copilot/langgraph/propose-devenv-deployment-message";
import { ProposeImageDeploymentMessage } from "@/components/copilot/langgraph/propose-image-deployment-message";

// Devbox Tool Messages
import { UpdateDevboxToolMessage } from "@/components/copilot/sealos/devbox/updateDevboxToolMessage";
import { StartDevboxToolMessage } from "@/components/copilot/sealos/devbox/startDevboxToolMessage";
import { PauseDevboxToolMessage } from "@/components/copilot/sealos/devbox/pauseDevboxToolMessage";
import { DeleteDevboxToolMessage } from "@/components/copilot/sealos/devbox/deleteDevboxToolMessage";

// Cluster Tool Messages
import { UpdateClusterToolMessage } from "@/components/copilot/sealos/cluster/updateClusterToolMessage";
import { StartClusterToolMessage } from "@/components/copilot/sealos/cluster/startClusterToolMessage";
import { PauseClusterToolMessage } from "@/components/copilot/sealos/cluster/pauseClusterToolMessage";
import { DeleteClusterToolMessage } from "@/components/copilot/sealos/cluster/deleteClusterToolMessage";

// Launchpad Tool Messages
import { UpdateLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/updateLaunchpadToolMessage";
import { StartLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/startLaunchpadToolMessage";
import { PauseLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/pauseLaunchpadToolMessage";
import { DeleteLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/deleteLaunchpadToolMessage";

// Result schema for tool actions
export interface ToolActionResult {
  action: string;
  payload: Record<string, any>;
  success: boolean;
  result: any;
  message: string;
}

// Resource Types
export type CPUAllocation = 1 | 2 | 4 | 8 | 16;
export type MemoryAllocation = 1 | 2 | 4 | 8 | 16 | 32;
export type ClusterCPUAllocation = 1 | 2 | 4 | 8;
export type TerminationPolicy = "Delete" | "Retain";

// Base Resource Interfaces
export interface BaseResource {
  cpu?: CPUAllocation;
  memory?: MemoryAllocation;
}

export interface ClusterResource extends BaseResource {
  cpu?: ClusterCPUAllocation;
  replicas?: number; // 1-20
  storage?: number; // 3-300 GB
}

export interface DevboxResource extends BaseResource {
  // Devbox uses the base resource interface
}

export interface LaunchpadResource extends BaseResource {
  replicas?: number; // 1-20
}

// Context Interfaces
export interface BaseContext {
  kubeconfig: string;
  regionUrl: string;
}

// Payload Interfaces
export interface BasePayload {
  name: string; // DNS compliant: lowercase, numbers, hyphens, 1-63 chars
}

export interface DevboxUpdatePayload extends BasePayload {
  resource: DevboxResource;
}

export interface DevboxStartPayload extends BasePayload {}

export interface DevboxPausePayload extends BasePayload {}

export interface DevboxDeletePayload extends BasePayload {}

export interface ClusterUpdatePayload extends BasePayload {
  resource: ClusterResource;
}

export interface ClusterStartPayload extends BasePayload {}

export interface ClusterPausePayload extends BasePayload {}

export interface ClusterDeletePayload extends BasePayload {}

export interface LaunchpadUpdatePayload extends BasePayload {
  resource: LaunchpadResource;
}

export interface LaunchpadStartPayload extends BasePayload {}

export interface LaunchpadPausePayload extends BasePayload {}

export interface LaunchpadDeletePayload extends BasePayload {}

export const ToolMessageType = {
  // Devbox Actions
  update_devbox: (result: ToolActionResult) => {
    return <UpdateDevboxToolMessage result={result} />;
  },

  start_devbox: (result: ToolActionResult) => {
    return <StartDevboxToolMessage result={result} />;
  },

  pause_devbox: (result: ToolActionResult) => {
    return <PauseDevboxToolMessage result={result} />;
  },

  delete_devbox: (result: ToolActionResult) => {
    return <DeleteDevboxToolMessage result={result} />;
  },

  // Cluster Actions
  update_cluster: (result: ToolActionResult) => {
    return <UpdateClusterToolMessage result={result} />;
  },

  start_cluster: (result: ToolActionResult) => {
    return <StartClusterToolMessage result={result} />;
  },

  pause_cluster: (result: ToolActionResult) => {
    return <PauseClusterToolMessage result={result} />;
  },

  delete_cluster: (result: ToolActionResult) => {
    return <DeleteClusterToolMessage result={result} />;
  },

  // Launchpad Actions
  update_launchpad: (result: ToolActionResult) => {
    return <UpdateLaunchpadToolMessage result={result} />;
  },

  start_launchpad: (result: ToolActionResult) => {
    return <StartLaunchpadToolMessage result={result} />;
  },

  pause_launchpad: (result: ToolActionResult) => {
    return <PauseLaunchpadToolMessage result={result} />;
  },

  delete_launchpad: (result: ToolActionResult) => {
    return <DeleteLaunchpadToolMessage result={result} />;
  },

  // Search Actions
  search_app_store: (
    payload: any,
    _result?: any,
    _onSuccess?: (data: any) => void
  ) => {
    return <SearchAppStoreActionMessage result={payload} />;
  },

  search_docker_hub: (
    payload: any,
    _result?: any,
    _onSuccess?: (data: any) => void
  ) => {
    return <SearchDockerHubActionMessage result={payload} />;
  },

  search_web: (
    payload: any,
    _result?: any,
    _onSuccess?: (data: any) => void
  ) => {
    return <SearchWebActionMessage result={payload} />;
  },

  // Deployment Proposal Actions
  propose_template_deployment: (
    payload: any,
    result?: any,
    onSuccess?: (data: any) => void
  ) => {
    return (
      <ProposeTemplateDeploymentMessage
        args={payload}
        result={result}
        onSuccess={onSuccess}
      />
    );
  },

  propose_devenv_deployment: (
    payload: any,
    result?: any,
    onSuccess?: (data: any) => void
  ) => {
    return (
      <ProposeDevenvDeploymentMessage
        args={payload}
        result={result}
        onSuccess={onSuccess}
      />
    );
  },

  propose_image_deployment: (
    payload: any,
    result?: any,
    onSuccess?: (data: any) => void
  ) => {
    return (
      <ProposeImageDeploymentMessage
        args={payload}
        result={result}
        onSuccess={onSuccess}
      />
    );
  },
};
