import { ProposeDevenvDeploymentMessage } from "@/components/copilot/langgraph/propose-devenv-deployment-message";
import { ProposeImageDeploymentMessage } from "@/components/copilot/langgraph/propose-image-deployment-message";
import { ProposeTemplateDeploymentMessage } from "@/components/copilot/langgraph/propose-template-deployment-message";
import { SearchAppStoreActionMessage } from "@/components/copilot/langgraph/search-app-store-action-message";
import { SearchDockerHubActionMessage } from "@/components/copilot/langgraph/search-docker-hub-action-message";
import { SearchWebActionMessage } from "@/components/copilot/langgraph/search-web-action-message";
import { SuggestionToolMessage } from "@/components/copilot/langgraph/suggestion-tool-message";
import { CreateClusterToolMessage } from "@/components/copilot/sealos/cluster/create-cluster-tool-message";
import { DeleteClusterToolMessage } from "@/components/copilot/sealos/cluster/delete-cluster-tool-message";
import { GetClusterLogsToolMessage } from "@/components/copilot/sealos/cluster/get-cluster-logs-tool-message";
import { GetClusterMonitorToolMessage } from "@/components/copilot/sealos/cluster/get-cluster-monitor-tool-message";
// Cluster Tool Messages
import { GetClusterToolMessage } from "@/components/copilot/sealos/cluster/get-cluster-tool-message";
import { PauseClusterToolMessage } from "@/components/copilot/sealos/cluster/pause-cluster-tool-message";
import { RestartClusterToolMessage } from "@/components/copilot/sealos/cluster/restart-cluster-tool-message";
import { StartClusterToolMessage } from "@/components/copilot/sealos/cluster/start-cluster-tool-message";
import { UpdateClusterToolMessage } from "@/components/copilot/sealos/cluster/update-cluster-tool-message";
import { AutostartDevboxToolMessage } from "@/components/copilot/sealos/devbox/autostart-devbox-tool-message";
import { CreateDevboxPortsToolMessage } from "@/components/copilot/sealos/devbox/create-devbox-ports-tool-message";
import { CreateDevboxToolMessage } from "@/components/copilot/sealos/devbox/create-devbox-tool-message";
import { DeleteDevboxPortsToolMessage } from "@/components/copilot/sealos/devbox/delete-devbox-ports-tool-message";
import { DeleteDevboxToolMessage } from "@/components/copilot/sealos/devbox/delete-devbox-tool-message";
import { DeployDevboxReleaseToolMessage } from "@/components/copilot/sealos/devbox/deploy-devbox-release-tool-message";
import { GetDevboxMonitorToolMessage } from "@/components/copilot/sealos/devbox/get-devbox-monitor-tool-message";
import { GetDevboxNetworkToolMessage } from "@/components/copilot/sealos/devbox/get-devbox-network-tool-message";
import { GetDevboxReleaseToolMessage } from "@/components/copilot/sealos/devbox/get-devbox-release-tool-message";
// Devbox Tool Messages
import { GetDevboxToolMessage } from "@/components/copilot/sealos/devbox/get-devbox-tool-message";
import { PauseDevboxToolMessage } from "@/components/copilot/sealos/devbox/pause-devbox-tool-message";
import { RestartDevboxToolMessage } from "@/components/copilot/sealos/devbox/restart-devbox-tool-message";
import { StartDevboxToolMessage } from "@/components/copilot/sealos/devbox/start-devbox-tool-message";
import { UpdateDevboxToolMessage } from "@/components/copilot/sealos/devbox/update-devbox-tool-message";
import { CreateLaunchpadEnvToolMessage } from "@/components/copilot/sealos/launchpad/create-launchpad-env-tool-message";
import { CreateLaunchpadPortsToolMessage } from "@/components/copilot/sealos/launchpad/create-launchpad-ports-tool-message";
import { CreateLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/create-launchpad-tool-message";
import { DeleteLaunchpadEnvToolMessage } from "@/components/copilot/sealos/launchpad/delete-launchpad-env-tool-message";
import { DeleteLaunchpadPortsToolMessage } from "@/components/copilot/sealos/launchpad/delete-launchpad-ports-tool-message";
import { DeleteLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/delete-launchpad-tool-message";
import { GetLaunchpadLogsToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-logs-tool-message";
import { GetLaunchpadMonitorToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-monitor-tool-message";
import { GetLaunchpadNetworkToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-network-tool-message";
// Launchpad Tool Messages
import { GetLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/get-launchpad-tool-message";
import { PauseLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/pause-launchpad-tool-message";
import { RestartLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/restart-launchpad-tool-message";
import { StartLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/start-launchpad-tool-message";
import { UpdateLaunchpadCommandToolMessage } from "@/components/copilot/sealos/launchpad/update-launchpad-command-tool-message";
import { UpdateLaunchpadEnvToolMessage } from "@/components/copilot/sealos/launchpad/update-launchpad-env-tool-message";
import { UpdateLaunchpadImageToolMessage } from "@/components/copilot/sealos/launchpad/update-launchpad-image-tool-message";
import { UpdateLaunchpadToolMessage } from "@/components/copilot/sealos/launchpad/update-launchpad-tool-message";

// Result schema for tool actions
export interface ToolActionResult {
	action: string;
	payload: Record<string, any>;
	success: boolean;
	result: any;
	message: string;
	approved: boolean;
	error?: string;
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

	create_devbox_ports: (result: ToolActionResult) => {
		return <CreateDevboxPortsToolMessage result={result} />;
	},

	delete_devbox_ports: (result: ToolActionResult) => {
		return <DeleteDevboxPortsToolMessage result={result} />;
	},

	start_devbox: (result: ToolActionResult) => {
		return <StartDevboxToolMessage result={result} />;
	},

	restart_devbox: (result: ToolActionResult) => {
		return <RestartDevboxToolMessage result={result} />;
	},

	pause_devbox: (result: ToolActionResult) => {
		return <PauseDevboxToolMessage result={result} />;
	},

	autostart_devbox: (result: ToolActionResult) => {
		return <AutostartDevboxToolMessage result={result} />;
	},

	create_devbox: (result: ToolActionResult) => {
		return <CreateDevboxToolMessage result={result} />;
	},

	delete_devbox: (result: ToolActionResult) => {
		return <DeleteDevboxToolMessage result={result} />;
	},

	get_devbox_release: (result: ToolActionResult) => {
		return <GetDevboxReleaseToolMessage result={result} />;
	},

	deploy_devbox_release: (result: ToolActionResult) => {
		return <DeployDevboxReleaseToolMessage result={result} />;
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

	restart_cluster: (result: ToolActionResult) => {
		return <RestartClusterToolMessage result={result} />;
	},

	pause_cluster: (result: ToolActionResult) => {
		return <PauseClusterToolMessage result={result} />;
	},

	create_cluster: (result: ToolActionResult) => {
		return <CreateClusterToolMessage result={result} />;
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

	create_launchpad_ports: (result: ToolActionResult) => {
		return <CreateLaunchpadPortsToolMessage result={result} />;
	},

	delete_launchpad_ports: (result: ToolActionResult) => {
		return <DeleteLaunchpadPortsToolMessage result={result} />;
	},

	create_launchpad_env: (result: ToolActionResult) => {
		return <CreateLaunchpadEnvToolMessage result={result} />;
	},

	delete_launchpad_env: (result: ToolActionResult) => {
		return <DeleteLaunchpadEnvToolMessage result={result} />;
	},

	update_launchpad_env: (result: ToolActionResult) => {
		return <UpdateLaunchpadEnvToolMessage result={result} />;
	},

	update_launchpad_image: (result: ToolActionResult) => {
		return <UpdateLaunchpadImageToolMessage result={result} />;
	},

	update_launchpad_command: (result: ToolActionResult) => {
		return <UpdateLaunchpadCommandToolMessage result={result} />;
	},

	start_launchpad: (result: ToolActionResult) => {
		return <StartLaunchpadToolMessage result={result} />;
	},

	restart_launchpad: (result: ToolActionResult) => {
		return <RestartLaunchpadToolMessage result={result} />;
	},

	pause_launchpad: (result: ToolActionResult) => {
		return <PauseLaunchpadToolMessage result={result} />;
	},

	create_launchpad: (result: ToolActionResult) => {
		return <CreateLaunchpadToolMessage result={result} />;
	},

	delete_launchpad: (result: ToolActionResult) => {
		return <DeleteLaunchpadToolMessage result={result} />;
	},

	// Search Actions
	search_app_store: (
		payload: any,
		_result?: any,
		_onSuccess?: (data: any) => void,
	) => {
		return <SearchAppStoreActionMessage result={payload} />;
	},

	search_docker_hub: (
		payload: any,
		_result?: any,
		_onSuccess?: (data: any) => void,
	) => {
		return <SearchDockerHubActionMessage result={payload} />;
	},

	search_web: (
		payload: any,
		_result?: any,
		_onSuccess?: (data: any) => void,
	) => {
		return <SearchWebActionMessage result={payload} />;
	},

	// Deployment Proposal Actions
	propose_template_deployment: (
		payload: any,
		result?: any,
		onSuccess?: (data: any) => void,
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
		onSuccess?: (data: any) => void,
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
		onSuccess?: (data: any) => void,
	) => {
		return (
			<ProposeImageDeploymentMessage
				args={payload}
				result={result}
				onSuccess={onSuccess}
			/>
		);
	},

	// Suggestion Tool
	suggestion: (result: ToolActionResult) => {
		return <SuggestionToolMessage result={result} />;
	},
};
