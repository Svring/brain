import { AddResourceToProjectActionMessage } from "@/components/copilot/brain/project/add-resource-to-project-action-message";
import { ProjectProposalActionMessage } from "@/components/copilot/brain/project/project-proposal-action-message";
import { ProjectLogsActionMessage } from "@/components/copilot/brain/project/project-logs-action-message";
import { DevboxCreateActionMessage } from "@/components/copilot/sealos/devbox/devbox-create-action-message";
import { DevboxUpdateActionMessage } from "@/components/copilot/sealos/devbox/devbox-update-action-message";
import { DevboxLifecycleActionMessage } from "@/components/copilot/sealos/devbox/devbox-lifecycle-action-message";
import { ClusterCreateActionMessage } from "@/components/copilot/sealos/cluster/cluster-create-action-message";
import { ClusterUpdateActionMessage } from "@/components/copilot/sealos/cluster/cluster-update-action-message";
import { ClusterLifecycleActionMessage } from "@/components/copilot/sealos/cluster/cluster-lifecycle-action-message";
import { LaunchpadCreateActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-create-action-message";
import { LaunchpadUpdateActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-update-action-message";
import { LaunchpadLifecycleActionMessage } from "@/components/copilot/sealos/launchpad/launchpad-lifecycle-action-message";

export const ToolMessageType = {
  // Project Actions
  propose_project: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return <ProjectProposalActionMessage args={payload} result={result} onSuccess={onSuccess} />;
  },

  add_resource_to_project: (payload: any) => {
    return <AddResourceToProjectActionMessage resources={payload} />;
  },

  get_project_resources: (payload: any) => {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
          <div className="text-sm text-foreground">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },

  check_all_logs: (payload: any) => {
    return <ProjectLogsActionMessage result={payload} />;
  },

  // Devbox Actions
  createDevbox: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return <DevboxCreateActionMessage args={payload} result={result} onSuccess={onSuccess} />;
  },

  updateDevbox: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return <DevboxUpdateActionMessage args={payload} result={result} onSuccess={onSuccess} />;
  },

  devboxLifecycle: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return (
      <DevboxLifecycleActionMessage
        args={payload}
        action={payload.action}
        result={result}
        onSuccess={onSuccess}
      />
    );
  },

  getDevboxData: (payload: any) => {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
          <div className="text-sm text-foreground">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },

  releaseDevbox: (payload: any) => {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
          <div className="text-sm text-foreground">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },

  deployDevbox: (payload: any) => {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
          <div className="text-sm text-foreground">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },

  // Cluster Actions
  createCluster: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return <ClusterCreateActionMessage args={payload} result={result} onSuccess={onSuccess} />;
  },

  updateCluster: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return <ClusterUpdateActionMessage args={payload} result={result} onSuccess={onSuccess} />;
  },

  clusterLifecycle: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return (
      <ClusterLifecycleActionMessage
        args={payload}
        action={payload.action}
        result={result}
        onSuccess={onSuccess}
      />
    );
  },

  getClusterData: (payload: any) => {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
          <div className="text-sm text-foreground">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },

  // Launchpad Actions
  createLaunchpad: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return <LaunchpadCreateActionMessage args={payload} result={result} onSuccess={onSuccess} />;
  },

  updateLaunchpad: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return <LaunchpadUpdateActionMessage args={payload} result={result} onSuccess={onSuccess} />;
  },

  launchpadLifecycle: (payload: any, result?: any, onSuccess?: (data: any) => void) => {
    return (
      <LaunchpadLifecycleActionMessage
        args={payload}
        action={payload.action}
        result={result}
        onSuccess={onSuccess}
      />
    );
  },

  getLaunchpadData: (payload: any) => {
    return (
      <div className="flex justify-start w-full">
        <div className="bg-background-secondary border border-border-primary rounded-lg p-4 max-w-full">
          <div className="text-sm text-foreground">
            <pre className="whitespace-pre-wrap break-words">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  },
};
