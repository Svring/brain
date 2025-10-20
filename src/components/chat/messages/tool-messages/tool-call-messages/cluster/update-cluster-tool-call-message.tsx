import { useEffect, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import {
	CLUSTER_CPU_OPTIONS,
	CLUSTER_MEMORY_OPTIONS,
	type ClusterCpuOption,
	type ClusterMemoryOption,
} from "@/schemas/forms/cluster/components/cluster-resource-schema";

interface UpdateClusterToolCallMessageProps {
	cluster_name: string;
	type?: string;
	cpu?: ClusterCpuOption;
	memory?: ClusterMemoryOption;
	storage?: number;
	replicas?: number;
	setInterruptData?: (data: any) => void;
}

// Import storage and replicas options
import {
	REPLICAS_OPTIONS,
	STORAGE_OPTIONS,
} from "@/lib/k8s/k8s-constant/k8s-constant-resource";

// CPU options for cluster
export function UpdateClusterToolCallMessage({
	cluster_name,
	type = "postgresql",
	cpu,
	memory,
	storage,
	replicas,
	setInterruptData,
}: UpdateClusterToolCallMessageProps) {
	const iconUrl = getClusterIconUrl(type);

	// State to track current values for interactive sliders
	const [currentCpu, setCurrentCpu] = useState(cpu);
	const [currentMemory, setCurrentMemory] = useState(memory);
	const [currentStorage, setCurrentStorage] = useState(storage);
	const [currentReplicas, setCurrentReplicas] = useState(replicas);

	// Update state when props change
	useEffect(() => {
		setCurrentCpu(cpu);
	}, [cpu]);

	useEffect(() => {
		setCurrentMemory(memory);
	}, [memory]);

	useEffect(() => {
		setCurrentStorage(storage);
	}, [storage]);

	useEffect(() => {
		setCurrentReplicas(replicas);
	}, [replicas]);

	// Get current indices for sliders
	const cpuIndex =
		currentCpu !== undefined
			? CLUSTER_CPU_OPTIONS.findIndex((option) => option === currentCpu)
			: -1;
	const memoryIndex =
		currentMemory !== undefined
			? CLUSTER_MEMORY_OPTIONS.findIndex((option) => option === currentMemory)
			: -1;
	const storageIndex =
		currentStorage !== undefined
			? STORAGE_OPTIONS.findIndex((option) => option === currentStorage)
			: -1;
	const replicasIndex =
		currentReplicas !== undefined
			? REPLICAS_OPTIONS.findIndex((option) => option === currentReplicas)
			: -1;

	// Handle slider changes to update interrupt data
	const handleCpuChange = (newCpuIndex: number) => {
		const newCpu = CLUSTER_CPU_OPTIONS[newCpuIndex];
		setCurrentCpu(newCpu);

		if (setInterruptData) {
			setInterruptData((prevData: any) => ({
				...prevData,
				payload: {
					...prevData.payload,
					cpu: newCpu,
				},
			}));
		}
	};

	const handleMemoryChange = (newMemoryIndex: number) => {
		const newMemory = CLUSTER_MEMORY_OPTIONS[newMemoryIndex];
		setCurrentMemory(newMemory);

		if (setInterruptData) {
			setInterruptData((prevData: any) => ({
				...prevData,
				payload: {
					...prevData.payload,
					memory: newMemory,
				},
			}));
		}
	};

	const handleStorageChange = (newStorageIndex: number) => {
		const newStorage = STORAGE_OPTIONS[newStorageIndex];
		setCurrentStorage(newStorage);

		if (setInterruptData) {
			setInterruptData((prevData: any) => ({
				...prevData,
				payload: {
					...prevData.payload,
					storage: newStorage,
				},
			}));
		}
	};

	const handleReplicasChange = (newReplicasIndex: number) => {
		const newReplicas = REPLICAS_OPTIONS[newReplicasIndex];
		setCurrentReplicas(newReplicas);

		if (setInterruptData) {
			setInterruptData((prevData: any) => ({
				...prevData,
				payload: {
					...prevData.payload,
					replicas: newReplicas,
				},
			}));
		}
	};

	return (
		<div className="w-full max-w-2xl">
			<div className="flex flex-col gap-2 p-4 rounded-xl border bg-background-secondary">
				{(cpu !== undefined ||
					memory !== undefined ||
					storage !== undefined ||
					replicas !== undefined) && (
					<div className="space-y-3">
						{cpu !== undefined && (
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium text-muted-foreground">
										CPU:
									</span>
									<span className="text-sm text-foreground font-mono">
										{currentCpu}Core
									</span>
								</div>
								<div className="space-y-1">
									<Slider
										value={[cpuIndex]}
										min={0}
										max={CLUSTER_CPU_OPTIONS.length - 1}
										step={1}
										onValueChange={(value) => handleCpuChange(value[0])}
										className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
										aria-label="CPU slider"
										disabled={!setInterruptData}
									/>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											{CLUSTER_CPU_OPTIONS[0]}C
										</span>
										<span className="text-sm text-muted-foreground">
											{CLUSTER_CPU_OPTIONS[CLUSTER_CPU_OPTIONS.length - 1]}C
										</span>
									</div>
								</div>
							</div>
						)}
						{memory !== undefined && (
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium text-muted-foreground">
										Memory:
									</span>
									<span className="text-sm text-foreground font-mono">
										{currentMemory}G
									</span>
								</div>
								<div className="space-y-1">
									<Slider
										value={[memoryIndex]}
										min={0}
										max={CLUSTER_MEMORY_OPTIONS.length - 1}
										step={1}
										onValueChange={(value) => handleMemoryChange(value[0])}
										className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
										aria-label="Memory slider"
										disabled={!setInterruptData}
									/>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											{CLUSTER_MEMORY_OPTIONS[0]}G
										</span>
										<span className="text-sm text-muted-foreground">
											{
												CLUSTER_MEMORY_OPTIONS[
													CLUSTER_MEMORY_OPTIONS.length - 1
												]
											}
											G
										</span>
									</div>
								</div>
							</div>
						)}
						{storage !== undefined && (
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium text-muted-foreground">
										Storage:
									</span>
									<span className="text-sm text-foreground font-mono">
										{currentStorage}GB
									</span>
								</div>
								<div className="space-y-1">
									<Slider
										value={[storageIndex]}
										min={0}
										max={STORAGE_OPTIONS.length - 1}
										step={1}
										onValueChange={(value) => handleStorageChange(value[0])}
										className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
										aria-label="Storage slider"
										disabled={!setInterruptData}
									/>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											{STORAGE_OPTIONS[0]}GB
										</span>
										<span className="text-sm text-muted-foreground">
											{STORAGE_OPTIONS[STORAGE_OPTIONS.length - 1]}GB
										</span>
									</div>
								</div>
							</div>
						)}
						{replicas !== undefined && (
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium text-muted-foreground">
										Replicas:
									</span>
									<span className="text-sm text-foreground font-mono">
										{currentReplicas}
									</span>
								</div>
								<div className="space-y-1">
									<Slider
										value={[replicasIndex]}
										min={0}
										max={REPLICAS_OPTIONS.length - 1}
										step={1}
										onValueChange={(value) => handleReplicasChange(value[0])}
										className="[&>:last-child>span]:h-4 [&>:last-child>span]:w-2 [&>:last-child>span]:border-[2px] [&>:last-child>span]:border-background [&>:last-child>span]:bg-primary [&>:last-child>span]:ring-offset-0"
										aria-label="Replicas slider"
										disabled={!setInterruptData}
									/>
									<div className="flex justify-between">
										<span className="text-sm text-muted-foreground">
											{REPLICAS_OPTIONS[0]}
										</span>
										<span className="text-sm text-muted-foreground">
											{REPLICAS_OPTIONS[REPLICAS_OPTIONS.length - 1]}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
