// Devbox Tool Call Messages
import { GetDevboxToolCallMessage } from "./tool-call-messages/devbox/get-devbox-tool-call-message";
import { GetDevboxMonitorToolCallMessage } from "./tool-call-messages/devbox/get-devbox-monitor-tool-call-message";
import { GetDevboxNetworkToolCallMessage } from "./tool-call-messages/devbox/get-devbox-network-tool-call-message";
import { UpdateDevboxToolCallMessage } from "./tool-call-messages/devbox/update-devbox-tool-call-message";
import { CreateDevboxPortsToolCallMessage } from "./tool-call-messages/devbox/create-devbox-ports-tool-call-message";
import { DeleteDevboxPortsToolCallMessage } from "./tool-call-messages/devbox/delete-devbox-ports-tool-call-message";
import { StartDevboxToolCallMessage } from "./tool-call-messages/devbox/start-devbox-tool-call-message";
import { PauseDevboxToolCallMessage } from "./tool-call-messages/devbox/pause-devbox-tool-call-message";
import { CreateDevboxToolCallMessage } from "./tool-call-messages/devbox/create-devbox-tool-call-message";
import { DeleteDevboxToolCallMessage } from "./tool-call-messages/devbox/delete-devbox-tool-call-message";

// Cluster Tool Call Messages
import { GetClusterToolCallMessage } from "./tool-call-messages/cluster/get-cluster-tool-call-message";
import { GetClusterLogsToolCallMessage } from "./tool-call-messages/cluster/get-cluster-logs-tool-call-message";
import { GetClusterMonitorToolCallMessage } from "./tool-call-messages/cluster/get-cluster-monitor-tool-call-message";
import { UpdateClusterToolCallMessage } from "./tool-call-messages/cluster/update-cluster-tool-call-message";
import { StartClusterToolCallMessage } from "./tool-call-messages/cluster/start-cluster-tool-call-message";
import { PauseClusterToolCallMessage } from "./tool-call-messages/cluster/pause-cluster-tool-call-message";
import { CreateClusterToolCallMessage } from "./tool-call-messages/cluster/create-cluster-tool-call-message";
import { DeleteClusterToolCallMessage } from "./tool-call-messages/cluster/delete-cluster-tool-call-message";

// Launchpad Tool Call Messages
import { GetLaunchpadToolCallMessage } from "./tool-call-messages/launchpad/get-launchpad-tool-call-message";
import { GetLaunchpadLogsToolCallMessage } from "./tool-call-messages/launchpad/get-launchpad-logs-tool-call-message";
import { GetLaunchpadMonitorToolCallMessage } from "./tool-call-messages/launchpad/get-launchpad-monitor-tool-call-message";
import { GetLaunchpadNetworkToolCallMessage } from "./tool-call-messages/launchpad/get-launchpad-network-tool-call-message";
import { UpdateLaunchpadToolCallMessage } from "./tool-call-messages/launchpad/update-launchpad-tool-call-message";
import { CreateLaunchpadPortsToolCallMessage } from "./tool-call-messages/launchpad/create-launchpad-ports-tool-call-message";
import { DeleteLaunchpadPortsToolCallMessage } from "./tool-call-messages/launchpad/delete-launchpad-ports-tool-call-message";
import { CreateLaunchpadEnvToolCallMessage } from "./tool-call-messages/launchpad/create-launchpad-env-tool-call-message";
import { DeleteLaunchpadEnvToolCallMessage } from "./tool-call-messages/launchpad/delete-launchpad-env-tool-call-message";
import { UpdateLaunchpadEnvToolCallMessage } from "./tool-call-messages/launchpad/update-launchpad-env-tool-call-message";
import { UpdateLaunchpadImageToolCallMessage } from "./tool-call-messages/launchpad/update-launchpad-image-tool-call-message";
import { StartLaunchpadToolCallMessage } from "./tool-call-messages/launchpad/start-launchpad-tool-call-message";
import { PauseLaunchpadToolCallMessage } from "./tool-call-messages/launchpad/pause-launchpad-tool-call-message";
import { CreateLaunchpadToolCallMessage } from "./tool-call-messages/launchpad/create-launchpad-tool-call-message";
import { DeleteLaunchpadToolCallMessage } from "./tool-call-messages/launchpad/delete-launchpad-tool-call-message";

export const ToolCallMessageType = {
  // Devbox Tool Calls
  get_devbox: (parameters: Record<string, any>) => {
    return (
      <GetDevboxToolCallMessage devbox_name={parameters.devbox_name || ""} />
    );
  },

  get_devbox_monitor: (parameters: Record<string, any>) => {
    return (
      <GetDevboxMonitorToolCallMessage
        devbox_name={parameters.devbox_name || ""}
        step={parameters.step || "2m"}
      />
    );
  },

  get_devbox_network: (parameters: Record<string, any>) => {
    return (
      <GetDevboxNetworkToolCallMessage
        devbox_name={parameters.devbox_name || ""}
      />
    );
  },

  update_devbox: (parameters: Record<string, any>) => {
    return (
      <UpdateDevboxToolCallMessage
        devbox_name={parameters.devbox_name || ""}
        cpu={parameters.cpu}
        memory={parameters.memory}
      />
    );
  },

  create_devbox_ports: (parameters: Record<string, any>) => {
    return (
      <CreateDevboxPortsToolCallMessage
        devbox_name={parameters.devbox_name || ""}
        ports={parameters.ports || []}
      />
    );
  },

  delete_devbox_ports: (parameters: Record<string, any>) => {
    return (
      <DeleteDevboxPortsToolCallMessage
        devbox_name={parameters.devbox_name || ""}
        ports={parameters.ports || []}
      />
    );
  },

  start_devbox: (parameters: Record<string, any>) => {
    return (
      <StartDevboxToolCallMessage devbox_name={parameters.devbox_name || ""} />
    );
  },

  pause_devbox: (parameters: Record<string, any>) => {
    return (
      <PauseDevboxToolCallMessage devbox_name={parameters.devbox_name || ""} />
    );
  },

  create_devbox: (parameters: Record<string, any>) => {
    return (
      <CreateDevboxToolCallMessage
        name={parameters.name || ""}
        runtime={parameters.runtime || ""}
        cpu={parameters.cpu}
        memory={parameters.memory}
        ports={parameters.ports || []}
      />
    );
  },

  delete_devbox: (parameters: Record<string, any>) => {
    return (
      <DeleteDevboxToolCallMessage devbox_name={parameters.devbox_name || ""} />
    );
  },

  // Cluster Tool Calls
  get_cluster: (parameters: Record<string, any>) => {
    return (
      <GetClusterToolCallMessage cluster_name={parameters.cluster_name || ""} />
    );
  },

  get_cluster_logs: (parameters: Record<string, any>) => {
    return (
      <GetClusterLogsToolCallMessage
        cluster_name={parameters.cluster_name || ""}
      />
    );
  },

  get_cluster_monitor: (parameters: Record<string, any>) => {
    return (
      <GetClusterMonitorToolCallMessage
        cluster_name={parameters.cluster_name || ""}
        db_type={parameters.db_type || ""}
      />
    );
  },

  update_cluster: (parameters: Record<string, any>) => {
    return (
      <UpdateClusterToolCallMessage
        cluster_name={parameters.cluster_name || ""}
        cpu={parameters.cpu}
        memory={parameters.memory}
        // replicas={parameters.replicas}
        // storage={parameters.storage}
      />
    );
  },

  start_cluster: (parameters: Record<string, any>) => {
    return (
      <StartClusterToolCallMessage
        cluster_name={parameters.cluster_name || ""}
      />
    );
  },

  pause_cluster: (parameters: Record<string, any>) => {
    return (
      <PauseClusterToolCallMessage
        cluster_name={parameters.cluster_name || ""}
      />
    );
  },

  create_cluster: (parameters: Record<string, any>) => {
    return (
      <CreateClusterToolCallMessage
        name={parameters.name || ""}
        type={parameters.type || ""}
        cpu={parameters.cpu}
        memory={parameters.memory}
        storage={parameters.storage}
        replicas={parameters.replicas}
      />
    );
  },

  delete_cluster: (parameters: Record<string, any>) => {
    return (
      <DeleteClusterToolCallMessage
        cluster_name={parameters.cluster_name || ""}
      />
    );
  },

  // Launchpad Tool Calls
  get_launchpad: (parameters: Record<string, any>) => {
    return (
      <GetLaunchpadToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
      />
    );
  },

  get_launchpad_logs: (parameters: Record<string, any>) => {
    return (
      <GetLaunchpadLogsToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
      />
    );
  },

  get_launchpad_monitor: (parameters: Record<string, any>) => {
    return (
      <GetLaunchpadMonitorToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        step={parameters.step || "2m"}
      />
    );
  },

  get_launchpad_network: (parameters: Record<string, any>) => {
    return (
      <GetLaunchpadNetworkToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
      />
    );
  },

  update_launchpad: (parameters: Record<string, any>) => {
    return (
      <UpdateLaunchpadToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        cpu={parameters.cpu}
        memory={parameters.memory}
      />
    );
  },

  create_launchpad_ports: (parameters: Record<string, any>) => {
    return (
      <CreateLaunchpadPortsToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        ports={parameters.ports || []}
      />
    );
  },

  delete_launchpad_ports: (parameters: Record<string, any>) => {
    return (
      <DeleteLaunchpadPortsToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        ports={parameters.ports || []}
      />
    );
  },

  create_launchpad_env: (parameters: Record<string, any>) => {
    return (
      <CreateLaunchpadEnvToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        env_vars={parameters.env_vars || []}
      />
    );
  },

  delete_launchpad_env: (parameters: Record<string, any>) => {
    return (
      <DeleteLaunchpadEnvToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        env_names={parameters.env_names || []}
      />
    );
  },

  update_launchpad_env: (parameters: Record<string, any>) => {
    return (
      <UpdateLaunchpadEnvToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        env_vars={parameters.env_vars || []}
      />
    );
  },

  update_launchpad_image: (parameters: Record<string, any>) => {
    return (
      <UpdateLaunchpadImageToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
        image={parameters.image || ""}
      />
    );
  },

  start_launchpad: (parameters: Record<string, any>) => {
    return (
      <StartLaunchpadToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
      />
    );
  },

  pause_launchpad: (parameters: Record<string, any>) => {
    return (
      <PauseLaunchpadToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
      />
    );
  },

  create_launchpad: (parameters: Record<string, any>) => {
    return (
      <CreateLaunchpadToolCallMessage
        name={parameters.name || ""}
        image={parameters.image || ""}
        cpu={parameters.cpu}
        memory={parameters.memory}
        replicas={parameters.replicas}
        ports={parameters.ports || []}
        env={parameters.env || []}
      />
    );
  },

  delete_launchpad: (parameters: Record<string, any>) => {
    return (
      <DeleteLaunchpadToolCallMessage
        launchpad_name={parameters.launchpad_name || ""}
      />
    );
  },
};
