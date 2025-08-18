"use client";

import BaseNode from "../../base-node-wrapper";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy } from "lucide-react";
import NodeStatusLight from "../../components/node-status-light";
import NodeInternalUrl from "../../components/node-internal-url";
import NodeMonitor from "../../components/node-monitor";
import NodeLog from "../../components/node-log";
import NodePods from "../../components/node-pods";
import NodeBackup from "../../components/node-backup";
import NodeStack from "../../components/node-stack";
import ClusterNodeTitle from "./cluster-node-title";
import ClusterNodeMenu from "./cluster-node-menu";
import ClusterNodeBackup from "./cluster-node-backup";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useChatActions } from "@/contexts/chat/chat-context";
import { randomId } from "@copilotkit/shared";
import {
  createClusterContext,
  createK8sContext,
  createSealosContext,
} from "@/lib/auth/auth-utils";
import { useIsMutating } from "@tanstack/react-query";
import {
  getClusterBackupListOptions,
  getClusterOptions,
} from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { useQuery } from "@tanstack/react-query";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useSendMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { clusterClient } from "@/components/provider/trpc-provider";

export default function ClusterNode({ data }: { data: ClusterObject }) {
  const [publicAccess, setPublicAccess] = useState(false);
  const { sendMessage, setMessages, messages } = useCopilotChatHeadless_c();
  const { openSidebarChat } = useChatActions();
  const sendMessageMutation = useSendMessageMutation();

  const clusterTrpcClient = clusterClient.useTRPC();

  // Create contexts for API calls
  const k8sContext = createK8sContext();
  const clusterContext = createClusterContext();
  const sealosContext = createSealosContext();

  // Create target for the cluster
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster", data.name)
  );

  // Fetch real-time cluster data
  const { data: clusterData = data } = useQuery(
    getClusterOptions(k8sContext, target)
  );

  // Fetch cluster backup list
  const { data: backupList = [] } = useQuery(
    getClusterBackupListOptions(clusterContext, target)
  );

  const { name, type, status, pods, backup, connection } = clusterData;

  // const { data: monitorData } = useQuery(
  //   clusterTrpcClient.getClusterMonitorData.queryOptions({
  //     context: sealosContext,
  //     queryKey: "cpu",
  //     dbName: name,
  //     dbType: type,
  //   })
  // );

  // console.log("monitorData", monitorData);

  const isDeletingCluster =
    status === "Deleting" ||
    status === "Terminating" ||
    useIsMutating({
      predicate: (mutation) => {
        const isDeleteMutation =
          mutation.options.mutationFn?.toString().includes("deleteCluster") ??
          false;
        const variables = mutation.state.variables as any;
        return isDeleteMutation && variables?.name === name;
      },
    }) > 0;

  const handleNodeClick = () => {
    // Use the new mutation hook to send messages
    sendMessageMutation.mutate([
      {
        role: "assistant",
        content: `This is your database.`,
      },
      {
        role: "system",
        content: JSON.stringify({
          type: "info.clusterInfo",
          payload: target,
        }),
      },
    ]);
  };

  const mainCard = (
    <BaseNode
      nodeData={clusterData}
      className={isDeletingCluster ? "border-theme-red" : ""}
    >
      <div
        className="flex h-full flex-col gap-4 justify-between"
        onClick={handleNodeClick}
      >
        {/* Header with Name and Menu */}
        <div className="flex items-center justify-between">
          <ClusterNodeTitle name={name} type={type} />
          <div className="flex-shrink-0">
            <ClusterNodeMenu object={clusterData} />
          </div>
        </div>

        {/* Public Access Toggle and Copy Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Public Access</span>
            <Switch
              checked={publicAccess}
              onCheckedChange={setPublicAccess}
              className="scale-75"
            />
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
            }}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status!} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={[]} /> */}
            {/* <NodePods pods={pods} /> */}
            <NodeLog />
            <NodeBackup />
            {/* <NodeMonitor /> */}
          </div>
        </div>
      </div>
    </BaseNode>
  );

  return <NodeStack mainCard={mainCard} data={backupList} />;
}
