"use client";

import BaseNode from "../../base-node-wrapper";
import NodeStatusLight from "../../components/node-status-light";
import NodeInternalUrl from "../../components/node-internal-url";
import NodeMonitor from "../../components/node-monitor";
import NodeLog from "../../components/node-log";
import NodePods from "../../components/node-pods";
import NodeBackup from "../../components/node-backup";
import NodeStack from "../../components/node-stack";
import NodeHem from "../../components/node-hem";
import ClusterNodeTitle from "./cluster-node-title";
import ClusterNodeMenu from "./cluster-node-menu";
import ClusterNodeBackup from "./cluster-node-backup";
import { ClusterObject } from "@/lib/sealos/resources/cluster/cluster-schemas/cluster-object-schema";
import { createK8sContext } from "@/lib/auth/auth-utils";
import { useIsMutating } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { useSendSystemMessageMutation } from "@/lib/langgraph/langgraph-method/langgraph-mutation";
import { clusterClient } from "@/components/provider/trpc-provider";
import { convertToDbconnUrl } from "@/lib/sealos/sealos-utils";
import { Globe, HardDrive } from "lucide-react";
import { useResourceMetrics } from "@/hooks/sealos/use-resource-metrics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ClusterNode({ data }: { data: ClusterObject }) {
  const { sendSystemMessage } = useSendSystemMessageMutation();

  // Create contexts for API calls
  const k8sContext = createK8sContext();

  // Create target for the cluster
  const target = CustomResourceTargetSchema.parse(
    convertResourceTypeToTarget("cluster", data.name)
  );

  const clusterTrpcClient = clusterClient.useTRPC();

  // Fetch real-time cluster data
  const { data: clusterData = data } = useQuery(
    clusterTrpcClient.getCluster.queryOptions({
      target: target,
    })
  );

  // console.log("clusterData", clusterData);

  // Get resource metrics data
  const { monitorData, isLoading: isMetricsLoading } = useResourceMetrics(data);

  // Get the latest data point for current values
  const latestData =
    monitorData && Array.isArray(monitorData) && monitorData.length > 0
      ? monitorData[monitorData.length - 3]
      : null;

  // Derive a safe storage percentage (0-100). Accepts values in 0-1 or 0-100.
  const storagePercent: number = (() => {
    const raw = latestData?.storage;
    if (raw === undefined || raw === null || Number.isNaN(raw as number)) {
      return 0;
    }
    const value = Number(raw);
    // If it's a fraction (0-1), convert to percent; else clamp to 0-100
    const percent = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, percent));
  })();

  // Fetch cluster backup list
  const { data: backupList = [] } = useQuery(
    clusterTrpcClient.getClusterBackupList.queryOptions({
      target: target,
    })
  );

  const { name, type, status } = clusterData;

  // Construct connection string
  const connectionString = (() => {
    try {
      const regionUrl = k8sContext.regionUrl;
      const publicConnection = clusterData.connection?.publicConnection;
      const privateConnection = clusterData.connection?.privateConnection;

      if (!regionUrl || !publicConnection?.port || !privateConnection) {
        return null;
      }

      const dbconnUrl = convertToDbconnUrl(regionUrl);
      const { username, password } = privateConnection;

      return `${type}://${username}:${password}@${dbconnUrl}:${publicConnection.port}/?directConnection=true`;
    } catch (error) {
      console.error("Error constructing connection string:", error);
      return null;
    }
  })();

  // console.log("Connection string:", connectionString);

  // console.log("clusterDataTyped", clusterDataTyped);

  // const { data: monitorData } = useQuery(
  //   clusterTrpcClient.getClusterMonitorData.queryOptions({
  //     context: sealosContext,
  //     queryKey: "cpu",
  //     dbName: name,
  //     dbType: type,
  //   })
  // );

  // const { data: monitorDataNew } = useQuery({
  //   ...clusterTrpcClient.getClusterCombinedMonitorData.queryOptions({
  //     context: sealosContext,
  //     dbName: name,
  //     dbType: type,
  //   }),
  // });

  // console.log("monitorDataNew", monitorDataNew);

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
    sendSystemMessage({
      type: "info.clusterInfo",
      payload: target,
    });
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

        {/* Public Access Indicator */}
        <div className="flex items-center gap-2 text-md">
          <Globe
            className={`h-4 w-4 ${
              connectionString ? "text-theme-green" : "text-theme-gray"
            }`}
          />
          <span
            className={`${
              connectionString ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Public Access
          </span>
        </div>

        {/* Bottom section with status and icons */}
        <div className="mt-auto flex justify-between items-center">
          {/* Left: Status light */}
          <NodeStatusLight status={status!} />

          {/* Right: Icon components */}
          <div className="flex items-center gap-2">
            {/* <NodeInternalUrl ports={[]} /> */}
            {/* <NodePods resource={clusterData || data} /> */}
            <NodeLog />
            <ClusterNodeBackup object={clusterData} />
            {/* <NodeBackup /> */}
            <NodeMonitor resource={data} />
          </div>
        </div>
      </div>
    </BaseNode>
  );

  // Hem component displaying storage information as a progress bar (left-to-right fill)
  const hemComponent = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative bg-node-background w-full h-full flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2 py-1 cursor-pointer hover:brightness-120">
            {/* Filled background representing used percentage */}
            <div
              className="absolute inset-y-0 left-0 bg-muted"
              style={{ width: `${storagePercent}%` }}
            />

            {/* Foreground content row */}
            <div className="relative z-10 flex items-center justify-between w-full">
              {/* Left side: Volume icon and label */}
              <div className="flex items-center gap-1">
                <HardDrive className="h-5 w-5" />
                <span className="text-md">Volume</span>
              </div>

              {/* Right side: Resource storage label (capacity) */}
              <div className="text-xs">
                {clusterData.resource?.storage || "N/A"}
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-background-secondary rounded-lg p-2"
        >
          <div className="text-xs">
            <div className="">Storage Usage</div>
            <div>{storagePercent.toFixed(1)}% used</div>
            <div className="text-muted-foreground">
              Capacity: {clusterData.resource?.storage || "N/A"}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="relative">
      {/* Background cards from NodeStack - positioned at the bottom */}
      {Array.from({ length: Math.min(backupList.length, 2) }, (_, index) => {
        const offset = (index + 1) * 8;
        const backgroundCardCount = Math.min(backupList.length, 2);
        return (
          <div
            key={index}
            className="absolute inset-0 cursor-pointer"
            style={{
              transform: `translate(${offset}px, -${offset}px)`,
              zIndex: backgroundCardCount - index, // Inverted z-index: higher index = lower z-index
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <BaseNode nodeData={{}} className="h-60" active={false}>
              <div className="w-full h-full" />
            </BaseNode>
          </div>
        );
      })}

      {/* Hem component - positioned above background cards */}
      {hemComponent && (
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="bg-muted border border-border-primary rounded-xl pt-8 text-xs flex flex-col h-60">
            <div className="flex-1"></div>
            <div className="h-10">{hemComponent}</div>
          </div>
        </div>
      )}

      {/* Main card - positioned at the top */}
      <div className="relative z-20">{mainCard}</div>
    </div>
  );
}
