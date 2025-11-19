"use client";

import { useHover } from "@reactuses/core";
import { useMutation } from "@tanstack/react-query";
import { Plus, Spline } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { useProjectState } from "@/contexts/project/project-context";
import { useResourceObjects } from "@/hooks/sealos/resource/use-resource-objects";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useInvalidateQueries } from "@/hooks/trpc/use-invalidate-queries";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { convertResourceObjectToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
	CLUSTER_DEFAULT_ICON,
	CLUSTER_TYPE_ICON_MAP,
} from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { deriveClusterEnvVariable } from "@/lib/sealos/services/env/cluster/cluster-env-utils";
import { cn } from "@/lib/utils";

interface NodeConnectProps {
	children: React.ReactNode;
	className?: string;
	target?: any;
}

function ResourceItem({
	resource,
	target,
	clusterObject,
}: {
	resource: any;
	target?: any;
	clusterObject?: any;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const { edges } = useFlowgraphState();
	const { invalidateQueries } = useInvalidateQueries();
	const resourceTarget = convertResourceObjectToTarget({
		kind: resource.kind,
		name: resource.name,
	});
	const { resource: fullResource } = useResourceStatus(resourceTarget);
	const { resource: targetResource } = useResourceStatus(target || {});
	const { launchpad } = useTRPCClients();
	const updateLaunchpad = useMutation({
		...launchpad.update.mutationOptions(),
		onSuccess: () => {
			invalidateQueries([launchpad.get.queryKey()], true);
			toast.success("Successfully connected!");
		},
	});

	const getClusterIcon = () => {
		if (!clusterObject?.type) return CLUSTER_DEFAULT_ICON;
		return CLUSTER_TYPE_ICON_MAP[clusterObject.type] || CLUSTER_DEFAULT_ICON;
	};

	const isConnected = () => {
		if (!target) return false;
		const resourceId = `${resource.kind.toLowerCase()}-${resource.name}`;
		const targetId = `${target.resourceType.toLowerCase()}-${target.name}`;
		return edges.some(
			(edge) =>
				(edge.source === resourceId && edge.target === targetId) ||
				(edge.source === targetId && edge.target === resourceId),
		);
	};

	const getEnvVars = () => {
		if (!fullResource?.connection) return {};
		const envVars: Record<string, any> = {};

		if (resource.kind.toLowerCase() === "cluster") {
			deriveClusterEnvVariable(resource.name).forEach((envVar) => {
				envVars[envVar.name] = envVar;
			});

			const { publicConnection } = fullResource.connection;
			if (publicConnection) {
				const name = resource.name.toUpperCase();
				const publicVars = {
					[`${name}_PUBLIC_PORT`]: publicConnection.port?.toString(),
					[`${name}_PUBLIC_CONNECTION_STRING`]:
						publicConnection.connectionString,
				};
				Object.entries(publicVars).forEach(([key, value]) => {
					if (value) envVars[key] = { name: key, value };
				});
			}
		}
		return envVars;
	};

	const handleClick = async () => {
		if (
			!target ||
			!fullResource ||
			!targetResource ||
			isLoading ||
			isConnected()
		)
			return;

		const envVars = getEnvVars();
		if (!Object.keys(envVars).length) return;

		setIsLoading(true);
		try {
			const currentEnv = (targetResource.env || []).reduce(
				(acc: Record<string, any>, envVar: any) => {
					if (envVar.name) acc[envVar.name] = envVar;
					return acc;
				},
				{},
			);
			await updateLaunchpad.mutateAsync({
				name: target.name,
				env: Object.values({ ...currentEnv, ...envVars }),
			});
		} catch (error) {
			console.error("Failed to update launchpad:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={cn(
				"flex items-center justify-between p-2 border rounded-md",
				isConnected()
					? "opacity-50 cursor-not-allowed bg-muted/30"
					: isLoading
						? "opacity-50 cursor-not-allowed"
						: "cursor-pointer hover:bg-muted/50",
			)}
			onClick={handleClick}
		>
			<div className="flex items-center gap-2">
				{resource.kind?.toLowerCase() === "cluster" && (
					<img
						src={getClusterIcon()}
						alt={clusterObject?.type || "cluster"}
						className="w-4 h-4 rounded-sm"
						onError={(e) => {
							(e.target as HTMLImageElement).src = CLUSTER_DEFAULT_ICON;
						}}
					/>
				)}
				<div>
					<span className="text-sm font-medium">{resource.name}</span>
					<span className="text-xs text-muted-foreground ml-2">
						(
						{resource.kind?.toLowerCase() === "cluster"
							? clusterObject?.type || "database"
							: resource.kind}
						)
					</span>
				</div>
			</div>
			{isConnected() ? (
				<span className="text-xs text-theme-blue font-medium">Connected</span>
			) : isLoading ? (
				<Spinner size={16} className="text-muted-foreground" />
			) : (
				<Plus className="w-4 h-4 text-muted-foreground" />
			)}
		</div>
	);
}

export default function NodeConnect({
	children,
	className,
	target,
}: NodeConnectProps) {
	const ref = useRef<HTMLDivElement>(null);
	const plusRef = useRef<HTMLDivElement>(null);
	const isHovering = useHover(ref);
	const isPlusHovering = useHover(plusRef);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [showIcon, setShowIcon] = useState(false);
	const { selectedProjectResources } = useProjectState();

	// Filter cluster resources and convert to targets
	const clusterResources =
		selectedProjectResources?.filter(
			(resource: any) => resource.kind?.toLowerCase() === "cluster",
		) || [];

	const clusterTargets = clusterResources.map((resource: any) =>
		convertResourceObjectToTarget({
			kind: resource.kind,
			name: resource.name,
		}),
	);

	// Get complete cluster objects using useResourceObjects
	const { data: clusterObjects, isLoading: isClusterLoading } =
		useResourceObjects(clusterTargets);

	useEffect(() => {
		const shouldShow = isHovering || isPlusHovering || isDialogOpen;
		if (shouldShow) {
			setShowIcon(true);
		} else {
			const timer = setTimeout(() => setShowIcon(false), 300);
			return () => clearTimeout(timer);
		}
	}, [isHovering, isPlusHovering, isDialogOpen]);

	return (
		<div ref={ref} className={cn("relative", className)}>
			{children}
			{showIcon && (
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<div
							ref={plusRef}
							className="absolute -top-5 -left-5 z-50 cursor-pointer"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-center rounded-full shadow-lg hover:scale-115 transition-all">
								<Spline className="w-8 h-8" />
							</div>
						</div>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Connect Node</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							{isClusterLoading ? (
								<div className="text-center py-8">
									<Spinner size={16} className="text-muted-foreground" />
									<p className="text-sm text-muted-foreground mt-2">
										Loading cluster resources...
									</p>
								</div>
							) : clusterObjects && clusterObjects.length > 0 ? (
								<div>
									<div className="space-y-2">
										{clusterResources.map((resource, index) => {
											const clusterObject = clusterObjects[index];
											return (
												<ResourceItem
													key={`${resource.name}-${index}`}
													resource={resource}
													target={target}
													clusterObject={clusterObject}
												/>
											);
										})}
									</div>
								</div>
							) : (
								<p className="text-sm text-muted-foreground text-center py-8">
									No available resources to connect to.
								</p>
							)}
						</div>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
}
