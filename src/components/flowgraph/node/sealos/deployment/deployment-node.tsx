"use client";

import { Package } from "lucide-react";
import { useLaunchpadObject } from "@/hooks/sealos/launchpad/use-launchpad-object";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { DeploymentObject } from "@/lib/sealos/resources/deployment/deployment-object-schema";
import { truncateImage } from "@/lib/sealos/sealos-utils";
import BaseNode from "../../base-node-wrapper";
import NodeConnect from "../../components/node-connect";
import NodeLog from "../../components/node-log";
import NodeMonitor from "../../components/node-monitor";
import NodePods from "../../components/node-pods";
import NodeStack from "../../components/node-stack";
import NodeStatus from "../../components/node-status";
import DeploymentNodeMenu from "./deployment-node-menu";
import DeploymentNodeTitle from "./deployment-node-title";

// Main component that receives the loaded resource data
function DeploymentNode({ data }: { data: DeploymentObject }) {
	// Construct node ID following the same pattern as other nodes
	const nodeId = `${data.kind?.toLowerCase() || "deployment"}-${
		data.name || ""
	}`;
	const resource = data;
	const target = convertResourceObjectToTarget({
		kind: resource.kind,
		name: resource.name,
	});

	const { resource: deploymentData, status } = useResourceStatus(target);
	const deploymentResource = deploymentData || resource;

	const mainCard = (
		// <NodeConnect target={target}>
		<BaseNode target={target} nodeId={nodeId} messageType="launchpad.detail">
			<div className="flex h-full flex-col gap-2 justify-between">
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between">
					<DeploymentNodeTitle name={deploymentResource.name} />
					<DeploymentNodeMenu object={deploymentResource} />
				</div>

				{/* Image with Package Icon */}
				<div className="flex items-center gap-2 mt-2">
					<Package className="h-4 w-4 text-muted-foreground" />
					<div className="text-md text-muted-foreground truncate flex-1">
						Image:{" "}
						{deploymentResource.image?.imageName
							? deploymentResource.image.imageName
							: "N/A"}
					</div>
				</div>

				{/* Bottom section with status and icons */}
				<div className="mt-auto flex justify-between items-center">
					{/* Left: Status light */}
					<NodeStatus target={target} />

					{/* Right: Icon components */}
					<div className="flex items-center gap-2">
						<NodeLog target={target} />
						<NodeMonitor target={target} />
					</div>
				</div>
			</div>
		</BaseNode>
	);

	// Create an array with length equal to deploymentResource.replicas for the stack
	const replicasArray = Array.from(
		{ length: deploymentResource.resource?.replicas - 1 || 0 },
		(_, i) => i,
	);

	return (
		<NodeStack
			target={target}
			mainCard={mainCard}
			data={replicasArray}
			nodeId={nodeId}
		/>
	);
}

// Export the main component as the default
export default DeploymentNode;
