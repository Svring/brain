"use client";

import React, { useCallback } from "react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useContainerStatus } from "@/hooks/sealos/network/use-container-status";
import { useNetworkStatus } from "@/hooks/sealos/network/use-network-status";
import { useNodeSelect } from "@/hooks/flowgraph/use-node-select";
import { useStreamContext } from "@/components/provider/stream-provider";
import { useThreads } from "@/components/provider/thread-provider";
import { useChatActions } from "@/contexts/chat/chat-context";
import {
  extractContainerPorts,
  ContainerPortsResult,
} from "@/lib/sealos/services/ports/ports-utils";
import {
  CustomResourceTarget,
  BuiltinResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

const analyzeNetworkPrompt = `
**Identity**

You are the Sealos Brain agent on the Sealos platform, assisting users in managing cloud computing resources within the Sealos ecosystem. One of your responsibilities is to analyze **network connection reports** to help users understand resource accessibility and identify any connection issues.

**Network Connection Report**
Each report includes:

- **Container Status**: Whether the container's internal port is reachable within the cluster.
- **Network Status**: Whether the public address configured through ingress/service is accessible from outside the cluster.
- **Raw Resource Metadata**: Relevant information about the resource (name, image, runtime, exposed ports, etc.).

Each resource has two network access layers:

1. **Container Port (Private Access)** – Determined by the container image. The container port is only accessible if the image is listening on that port.
2. **Public Ingress Service (Public Access)** – Configured by the user to expose a specific container port. Most issues occur when the wrong port is selected.

**Instruction**

You are in **NetworkAnalysisMode**. Respond only to requests related to this mode, using the provided report.

### Network Analysis Mode

Your role is to analyze the given network status data and provide a clear assessment of connection issues.

**Analysis Rules**

1. **Normal Status**
   - Both container and public access are reachable/ready.
   - Action: Report that the network connection is normal in a concise statement.

2. **Case 1 – Container Port Unreachable, Public Access Unavailable**
   - Meaning: No service is listening on the exposed port.
   - Action: Recommend that the user checks the port the service is actually listening on and adjusts the public service configuration accordingly.

3. **Case 2 – Container Port Reachable, but Public Access Unavailable**
   - Meaning: The service is running internally, but the public ingress configuration is incorrect.
   - Action: Recommend checking the ingress configuration, firewall rules, or load balancer settings.

4. **Error Status**
   - If container access fails, highlight internal connection issues requiring immediate attention.

**Guiding Principles**
- Provide a concise response when the network connection is normal.
- If issues exist, clearly specify which layer has failed.
- Identify patterns or recurring network issues if present.
- Always explain how you interpreted the report (e.g., "Container port 8080 is unreachable, public URL returns 503").
- Do not repeat the original JSON report to the user; only summarize findings and recommendations.
- If multiple issues exist, report all of them.
`;

export function useDiagnoseNetwork(
  target: CustomResourceTarget | BuiltinResourceTarget
) {
  const { submitWithContext } = useStreamContext();
  const { addPendingMessage, triggerPendingMessages } = useChatActions();

  // Get container ports data for network diagnosis
  const containerStatusResult = useResourceStatus<ContainerPortsResult>(
    target,
    (resource) => extractContainerPorts(resource?.ports)
  );
  const containerPortsData = containerStatusResult.resource;

  // Use container status hook for network diagnosis
  const {
    data: containerStatus,
    isLoading: isContainerLoading,
    error: containerError,
  } = useContainerStatus(
    containerPortsData?.ports || [],
    containerPortsData?.host || "",
    2000 // 2 second timeout
  );

  // Use network status hook for public network diagnosis
  const { readyStatus: networkStatus } = useNetworkStatus(target);

  // Get the original resource to access port information
  const originalResource = (containerStatusResult as any).originalResource;

  // Format data in the structure expected by DiagnoseNetworkMessage
  const combinedStatusData = React.useMemo((): any[] => {
    if (!originalResource?.ports || !Array.isArray(originalResource.ports)) {
      return [];
    }

    return originalResource.ports.map((port: any): any => {
      // Get container status for this port
      const containerPortStatus = containerStatus?.find(
        (status: any) => status.port === port.number
      );
      const containerAccess = containerPortStatus?.reachable ?? false;

      // Get network status for this port
      const networkPortStatus = Array.isArray(networkStatus)
        ? networkStatus.find(
            (status: any) =>
              status.url === port.publicAddress ||
              status.url === port.privateAddress
          )
        : undefined;
      const publicAccessStatus = networkPortStatus?.ready ?? false;

      return {
        number: port.number,
        containerAccess,
        publicAccessStatus,
        publicAddress: port.publicAddress || "N/A",
        privateAddress: port.privateAddress || "N/A",
      };
    });
  }, [originalResource?.ports, containerStatus, networkStatus]);

  // Use node select to handle the selection and message appending
  const { handleNodeSelect } = useNodeSelect({
    target,
  });

  // console.log("combinedStatusData", combinedStatusData);

  const diagnoseNetwork = useCallback(
    (readyStatus: any) => {
      // Use node select to handle the selection and message appending
      handleNodeSelect();

      // Prepare network status data in the expected format
      const networkStatusData = {
        combinedStatusData,
        containerStatus,
        networkStatus,
      };

      // Add event message before analysis
      const eventMessage = {
        id: `network-event-${Date.now()}`,
        type: "system" as const,
        content: JSON.stringify({
          type: "universal.event",
          target: target,
          payload: {
            message: "Starting network analysis...",
            createdAt: new Date().toISOString(),
          },
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add pending messages for this resource target
      const systemMessage1 = {
        id: `network-system-1-${Date.now()}`,
        type: "system" as const,
        content: JSON.stringify({
          type: "universal.diagnoseNetwork",
          target,
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const systemMessage2 = {
        id: `network-system-2-${Date.now()}`,
        type: "system" as const,
        content:
          analyzeNetworkPrompt + "\n\n" + JSON.stringify(networkStatusData),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add pending messages for this resource target
      addPendingMessage(target, eventMessage);
      addPendingMessage(target, systemMessage1);
      addPendingMessage(target, systemMessage2);

      // Trigger pending message submission
      triggerPendingMessages(target);
    },
    [
      handleNodeSelect,
      addPendingMessage,
      triggerPendingMessages,
      combinedStatusData,
      containerStatus,
      networkStatus,
      target,
    ]
  );

  return {
    diagnoseNetwork,
    containerStatus,
    networkStatus,
    isContainerLoading,
    containerError,
    containerPortsData,
  };
}
