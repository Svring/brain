import { SearchAppStoreActionMessage } from "@/components/copilot/langgraph/search-app-store-action-message";
import { SearchDockerHubActionMessage } from "@/components/copilot/langgraph/search-docker-hub-action-message";
import { SearchWebActionMessage } from "@/components/copilot/langgraph/search-web-action-message";
import { ProposeTemplateDeploymentMessage } from "@/components/copilot/langgraph/propose-template-deployment-message";
import { ProposeDevenvDeploymentMessage } from "@/components/copilot/langgraph/propose-devenv-deployment-message";
import { ProposeImageDeploymentMessage } from "@/components/copilot/langgraph/propose-image-deployment-message";

// Devbox Tool Messages
import { GetDevboxToolMessage } from "@/components/copilot/sealos/devbox/get-devbox-tool-message";
import { GetDevboxMonitorToolMessage } from "@/components/copilot/sealos/devbox/get-devbox-monitor-tool-message";
import { GetDevboxNetworkToolMessage } from "@/components/copilot/sealos/devbox/get-devbox-network-tool-message";
import { UpdateDevboxToolMessage } from "@/components/copilot/sealos/devbox/updateDevboxToolMessage";
import { StartDevboxToolMessage } from "@/components/copilot/sealos/devbox/startDevboxToolMessage";
import { PauseDevboxToolMessage } from "@/components/copilot/sealos/devbox/pauseDevboxToolMessage";
import { DeleteDevboxToolMessage } from "@/components/copilot/sealos/devbox/deleteDevboxToolMessage";

// Cluster Tool Messages
import { GetClusterToolMessage } from "@/components/copilot/sealos/cluster/get-cluster-tool-message";
import { GetClusterLogsToolMessage } from "@/components/copilot/sealos/cluster/get-cluster-logs-tool-message";
import { GetClusterMonitorToolMessage } from "@/components/copilot/sealos/cluster/get-cluster-monitor-tool-message";
import { UpdateClusterToolMessage } from "@/components/copilot/sealos/cluster/updateClusterToolMessage";
import { StartClusterToolMessage } from "@/components/copilot/sealos/cluster/startClusterToolMessage";
import { PauseClusterToolMessage } from "@/components/copilot/sealos/cluster/pauseClusterToolMessage";
import { DeleteClusterToolMessage } from "@/components/copilot/sealos/cluster/deleteClusterToolMessage";

// Launchpad Tool Messages
import { GetLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-tool-message";
import { GetLaunchpadLogsToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-logs-tool-message";
import { GetLaunchpadMonitorToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-monitor-tool-message";
import { GetLaunchpadNetworkToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-network-tool-message";
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

export const ToolMessageType = {
  // Devbox Actions
  get_devbox: (result: ToolActionResult) => {
    return <GetDevboxToolMessage result={result} />;
  },

  get_devbox_monitor: (result: ToolActionResult) => {
    return <GetDevboxMonitorToolMessage result={result} />;
  },

  get_devbox_network: (result: ToolActionResult) => {
    return <GetDevboxNetworkToolMessage result={result} />;
  },

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
  get_cluster: (result: ToolActionResult) => {
    return <GetClusterToolMessage result={result} />;
  },

  get_cluster_logs: (result: ToolActionResult) => {
    return <GetClusterLogsToolMessage result={result} />;
  },

  get_cluster_monitor: (result: ToolActionResult) => {
    return <GetClusterMonitorToolMessage result={result} />;
  },

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
  get_launchpad: (result: ToolActionResult) => {
    return <GetLaunchpadToolMessage result={result} />;
  },

  get_launchpad_logs: (result: ToolActionResult) => {
    return <GetLaunchpadLogsToolMessage result={result} />;
  },

  get_launchpad_monitor: (result: ToolActionResult) => {
    return <GetLaunchpadMonitorToolMessage result={result} />;
  },

  get_launchpad_network: (result: ToolActionResult) => {
    return <GetLaunchpadNetworkToolMessage result={result} />;
  },

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
