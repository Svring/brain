"use client";

import { HardDrive, Package } from "lucide-react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import type { StatefulsetObject } from "@/lib/sealos/resources/statefulset/statefulset-object-schema";
import { truncateImage } from "@/lib/sealos/sealos-utils";
import BaseNode from "../../base-node-wrapper";
import NodeConnect from "../../components/node-connect";
import NodeHem from "../../components/node-hem";
import NodeLog from "../../components/node-log";
import NodeMonitor from "../../components/node-monitor";
import NodePods from "../../components/node-pods";
import NodeStatus from "../../components/node-status";
import StatefulsetNodeMenu from "./statefulset-node-menu";
import StatefulsetNodeTitle from "./statefulset-node-title";

// Main component that receives the loaded resource data
function StatefulsetNode({ data }: { data: StatefulsetObject }) {
	// Construct node ID following the same pattern as other nodes
	const nodeId = `${data.kind?.toLowerCase() || "statefulset"}-${
		data.name || ""
	}`;
	const resource = data;
	const target = convertResourceObjectToTarget(resource);

	const { resource: resourceData, status } = useResourceStatus(target);
	const statefulsetData = resourceData || resource;

	const mainCard = (
		// <NodeConnect target={target}>
		<BaseNode target={target} nodeId={nodeId} messageType="launchpad.detail">
			<div className="flex h-full flex-col gap-2 justify-between">
				{/* Header with Name and Dropdown */}
				<div className="flex items-center justify-between">
					<StatefulsetNodeTitle name={statefulsetData.name} />
					<StatefulsetNodeMenu object={statefulsetData} />
				</div>

				{/* Image with Package Icon */}
				<div className="flex items-center gap-2 mt-2">
					<Package className="h-4 w-4 text-muted-foreground" />
					<div className="text-sm text-muted-foreground truncate flex-1">
						Image:{" "}
						{statefulsetData.image?.imageName
							? statefulsetData.image.imageName
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
		// </NodeConnect>
	);

	// Hem component displaying storage information
	const hemComponent = (
		<div className="relative bg-node-background w-full h-full flex items-center rounded-b-xl text-xs text-muted-foreground overflow-hidden px-2 py-1">
			{/* Foreground content row */}
			<div className="relative z-10 flex items-center justify-between w-full">
				{/* Left side: Volume icon and label */}
				<div className="flex items-center gap-1">
					<HardDrive className="h-5 w-5" />
					<span className="text-md">Storage</span>
				</div>

				{/* Right side: Storage capacity */}
				<div className="text-xs">
					{statefulsetData.resource?.storage || "N/A"}GB
				</div>
			</div>
		</div>
	);

	return <NodeHem mainCard={mainCard} hemComponent={hemComponent} />;
}

// Export the main component as the default
export default StatefulsetNode;
