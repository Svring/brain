"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SimplePortList } from "@/components/chat/state-cards/project-proposal/components/simple-port-list";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectCreate } from "@/hooks/brain/use-project-create";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type {
	App,
	Database,
	DevBox,
	ProjectProposal,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import { AVAILABLE_CLUSTER_TYPES } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-types";
import { DEVBOX_RUNTIME_ICONS } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-icons";
import { DEVBOX_RUNTIMES } from "@/lib/sealos/resources/devbox/devbox-constant/devbox-constant-runtimes";
import { nanoid } from "@/lib/utils";
import { useResourceQuotaChecker } from "@/lib/validation/resource-quota-checker";
import { clusterCreateFormSchema } from "@/schemas/forms/cluster/cluster-create-form-schema";
import { devboxCreateFormSchema } from "@/schemas/forms/devbox/devbox-create-form-schema";
import { launchpadCreateFormSchema } from "@/schemas/forms/launchpad/launchpad-create-form-schema";

interface DevboxTemplate {
	runtime: string;
	config: {
		appPorts: Array<{
			name: string;
			port: number;
			protocol: string;
		}>;
		ports: Array<{
			containerPort: number;
			name: string;
			protocol: string;
		}>;
		releaseArgs: string[];
		releaseCommand: string[];
		user: string;
		workingDir: string;
	};
}

interface CreateNewProjectProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (projectName: string) => void;
}

export function CreateNewProject({
	open,
	onOpenChange,
	onConfirm,
}: CreateNewProjectProps) {
	const [projectName, setProjectName] = useState(`project-${nanoid()}`);
	const router = useRouter();
	const { devbox } = useTRPCClients();

	// Fetch devbox templates
	const { data: templates } = useQuery(devbox.templates.queryOptions());

	const { createProject, isCreating } = useProjectCreate({
		onSuccess: (createdProjectName: string) => {
			onConfirm(createdProjectName);
			onOpenChange(false);
			// Navigate to the created project - guard against undefined
			if (createdProjectName && createdProjectName !== "undefined") {
				router.push(`/projects/${createdProjectName}`);
			}
		},
		onError: (error: any) => {
			console.error("Project creation failed:", error);
		},
	});

	const { checkAndShowQuotaError } = useResourceQuotaChecker();

	// Runtime selection state
	const [editingDevbox, setEditingDevbox] = useState<number | null>(null);
	const [runtimeDialogOpen, setRuntimeDialogOpen] = useState(false);
	const [selectedRuntime, setSelectedRuntime] = useState<string>("");

	// State for created resources
	const [createdDevboxes, setCreatedDevboxes] = useState<DevBox[]>([]);
	const [createdApps, setCreatedApps] = useState<App[]>([]);

	// State for database counters per type
	const [databaseCounters, setDatabaseCounters] = useState<
		Record<string, number>
	>({
		postgresql: 0,
		mongodb: 0,
		"apecloud-mysql": 0,
		redis: 0,
		kafka: 0,
		milvus: 0,
	});

	const hasResources =
		createdDevboxes.length > 0 ||
		Object.values(databaseCounters).some((count) => count > 0) ||
		createdApps.some((app) => app.image && app.image.trim() !== "");

	const handleConfirm = async () => {
		if (isCreating || !hasResources) return;

		try {
			// Use project name from input (already has default value) and add nanoid
			const sanitizedProjectName = sanitizeName(projectName.trim());
			const uniqueProjectName = `${sanitizedProjectName}-${nanoid()}`;

			// Generate database resources from counters
			const databaseResources: Database[] = [];
			Object.entries(databaseCounters).forEach(([type, count]) => {
				for (let i = 0; i < count; i++) {
					databaseResources.push({
						name: `${sanitizeName(type)}-${nanoid()}`,
						type: type as any,
					});
				}
			});

			// Create ProjectProposal object with sanitized names and nanoid
			const projectProposal: ProjectProposal = {
				name: uniqueProjectName,
				resources: {
					devbox:
						createdDevboxes.length > 0
							? createdDevboxes.map((devbox) => ({
									name: `${sanitizeName(devbox.name)}-${nanoid()}`,
									runtime: devbox.runtime,
									ports:
										devbox.ports?.map((p: any) => ({
											number: p.number,
											publicAccess: p.publicAccess || true,
										})) || [],
								}))
							: undefined,
					database:
						databaseResources.length > 0 ? databaseResources : undefined,
					app:
						createdApps.length > 0
							? createdApps
									.filter((app) => app.image && app.image.trim() !== "")
									.map((app) => ({
										name: `${sanitizeName(app.name)}-${nanoid()}`,
										image: app.image,
										ports:
											app.ports?.map((p: any) => ({
												number: p.number,
												publicAccess: p.publicAccess || true,
											})) || [],
									}))
							: undefined,
				},
			};

			// 计算项目总资源需求
			let totalCpu = 0;
			let totalMemory = 0;
			let totalStorage = 0;
			let totalPorts = 0;

			// 获取schema默认值
			const devboxDefaults = devboxCreateFormSchema.parse({});
			const clusterDefaults = clusterCreateFormSchema.parse({});
			const launchpadDefaults = launchpadCreateFormSchema.parse({});

			// 计算DevBox资源
			if (createdDevboxes.length > 0) {
				createdDevboxes.forEach((devbox) => {
					totalCpu += devboxDefaults.resource.cpu;
					totalMemory += devboxDefaults.resource.memory;
					totalPorts += devbox.ports?.length || 0;
				});
			}

			// 计算Database资源
			Object.values(databaseCounters).forEach((count) => {
				if (count > 0) {
					totalCpu += clusterDefaults.resource.cpu * count;
					totalMemory += clusterDefaults.resource.memory * count;
					totalStorage += (clusterDefaults.resource.storage || 0) * count;
				}
			});

			// 计算App资源
			if (createdApps.length > 0) {
				createdApps
					.filter((app) => app.image && app.image.trim() !== "")
					.forEach((app) => {
						totalCpu += launchpadDefaults.resource.cpu;
						totalMemory += launchpadDefaults.resource.memory;
						totalPorts += app.ports?.length || 0;
					});
			}

			const quotaCheckPassed = checkAndShowQuotaError({
				cpu: totalCpu,
				memory: totalMemory,
				storage: totalStorage,
				ports: totalPorts,
			});

			if (!quotaCheckPassed) {
				return;
			}

			// Create the project with resources
			await createProject(projectProposal);

			// Reset form
			setProjectName(`project-${nanoid()}`);
			setCreatedDevboxes([]);
			setCreatedApps([]);
			setDatabaseCounters({
				postgresql: 0,
				mongodb: 0,
				"apecloud-mysql": 0,
				redis: 0,
				kafka: 0,
				milvus: 0,
			});
		} catch (error) {
			console.error("Failed to create project:", error);
		}
	};

	const handleCancel = () => {
		setProjectName(`project-${nanoid()}`);
		setCreatedDevboxes([]);
		setCreatedApps([]);
		setDatabaseCounters({
			postgresql: 0,
			mongodb: 0,
			"apecloud-mysql": 0,
			redis: 0,
			kafka: 0,
			milvus: 0,
		});
		onOpenChange(false);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleConfirm();
		} else if (e.key === "Escape") {
			handleCancel();
		}
	};

	// Update ports when runtime changes or when templates load
	useEffect(() => {
		if (templates && Array.isArray(templates) && editingDevbox !== null) {
			const devbox = createdDevboxes[editingDevbox];
			if (devbox && devbox.runtime) {
				const template = templates.find(
					(t: DevboxTemplate) => t.runtime === devbox.runtime,
				);

				if (template && template.config.appPorts) {
					const templatePorts = template.config.appPorts.map(
						(appPort: { port: number }) => ({
							number: appPort.port,
							publicAccess: true,
						}),
					);

					const updatedDevboxes = [...createdDevboxes];
					updatedDevboxes[editingDevbox].ports = templatePorts;
					setCreatedDevboxes(updatedDevboxes);
				}
			}
		}
	}, [editingDevbox]);

	// Database counter handlers
	const handleIncrementDatabase = (type: string) => {
		setDatabaseCounters((prev) => ({
			...prev,
			[type]: prev[type] + 1,
		}));
	};

	const handleDecrementDatabase = (type: string) => {
		setDatabaseCounters((prev) => ({
			...prev,
			[type]: Math.max(0, prev[type] - 1),
		}));
	};

	// Inline editing handlers
	const handleAddDevboxInline = () => {
		const newDevbox: DevBox = {
			name: generateDefaultName("devbox"),
			runtime: "next.js",
			ports: [],
		};

		// Add template ports if available
		if (templates && Array.isArray(templates)) {
			const template = templates.find(
				(t: DevboxTemplate) => t.runtime === "next.js",
			);

			if (template && template.config.appPorts) {
				const templatePorts = template.config.appPorts.map(
					(appPort: { port: number }) => ({
						number: appPort.port,
						publicAccess: true,
					}),
				);
				newDevbox.ports = templatePorts;
			}
		}

		setCreatedDevboxes([...createdDevboxes, newDevbox]);
	};

	const handleAddAppInline = () => {
		const newApp: App = {
			name: generateDefaultName("app"),
			image: "nginx:latest",
			ports: [],
		};
		setCreatedApps([...createdApps, newApp]);
	};

	const handleSelectRuntime = (runtime: string) => {
		setSelectedRuntime(runtime);
		setRuntimeDialogOpen(false);
		if (editingDevbox !== null) {
			const updatedDevboxes = [...createdDevboxes];
			updatedDevboxes[editingDevbox].runtime = runtime as any;

			// Update ports from template if available
			if (templates && Array.isArray(templates)) {
				const template = templates.find(
					(t: DevboxTemplate) => t.runtime === runtime,
				);

				if (template && template.config.appPorts) {
					const templatePorts = template.config.appPorts.map(
						(appPort: { port: number }) => ({
							number: appPort.port,
							publicAccess: true,
						}),
					);
					updatedDevboxes[editingDevbox].ports = templatePorts;
				}
			}

			setCreatedDevboxes(updatedDevboxes);
			setEditingDevbox(null);
		}
	};

	// Sanitize name for DNS compliance
	const sanitizeName = (name: string) => {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9-]/g, "-")
			.replace(/^-+|-+$/g, "")
			.replace(/-+/g, "-");
	};

	// Generate default names
	const generateDefaultName = (type: "devbox" | "database" | "app") => {
		const id = nanoid();
		return sanitizeName(`${type}-${id}`);
	};

	// Generate default project name
	const generateDefaultProjectName = () => {
		const id = nanoid();
		return `project-${id}`;
	};

	// Delete resource functions
	const handleDeleteDevbox = (index: number) => {
		setCreatedDevboxes(createdDevboxes.filter((_, i) => i !== index));
	};

	const handleDeleteApp = (index: number) => {
		setCreatedApps(createdApps.filter((_, i) => i !== index));
	};

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-[600px] max-h-[80vh]">
					<DialogHeader>
						<DialogTitle>Create New Project</DialogTitle>
					</DialogHeader>

					{/* Project Name Input */}
					<div className="pt-4">
						<div className="flex items-center gap-4">
							<Label
								htmlFor="project-name"
								className="text-right whitespace-nowrap"
							>
								Name
							</Label>
							<Input
								id="project-name"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								onKeyDown={handleKeyPress}
								placeholder="Enter project name"
								className="flex-1"
								autoFocus
							/>
						</div>
					</div>

					{/* Three Sections */}
					<div className="space-y-2">
						{/* Devbox Section */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Devbox</Label>

							{/* Existing devboxes */}
							{createdDevboxes.length > 0 && (
								<div className="space-y-2">
									{createdDevboxes.map((devbox, index) => (
										<div
											key={index}
											className="flex items-center p-2 py-1 bg-muted/20 rounded border"
										>
											{/* Runtime button on the left */}
											<div className="flex items-center gap-2 flex-shrink-0">
												<div className="w-5 h-5 flex items-center justify-center bg-background-tertiary rounded">
													<img
														src={
															DEVBOX_RUNTIME_ICONS[
																devbox.runtime as keyof typeof DEVBOX_RUNTIME_ICONS
															] || "https://devbox.bja.sealos.run/logo.svg"
														}
														alt={`${devbox.runtime} Icon`}
														width={20}
														height={20}
														className="rounded"
													/>
												</div>
												<Button
													size="sm"
													variant="ghost"
													className="px-2 text-sm"
													onClick={() => {
														setEditingDevbox(index);
														setRuntimeDialogOpen(true);
													}}
												>
													{devbox.runtime}
												</Button>
											</div>

											{/* Ports in the middle */}
											<div className="flex-1 mx-2">
												<SimplePortList
													ports={devbox.ports?.map((p: any) => p.number) || []}
													allowEditing={true}
													onPortsChange={(portNumbers) => {
														const updated = [...createdDevboxes];
														updated[index].ports = portNumbers.map((num) => ({
															number: num,
															publicAccess: true,
														}));
														setCreatedDevboxes(updated);
													}}
												/>
											</div>

											{/* Delete button on the right */}
											<Button
												size="sm"
												variant="ghost"
												className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
												onClick={() => handleDeleteDevbox(index)}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Add new devbox */}
							<div
								className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
								onClick={handleAddDevboxInline}
							>
								<div className="flex items-center justify-center gap-2">
									<Plus className="h-4 w-4 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">
										Add new devbox
									</span>
								</div>
							</div>
						</div>

						{/* Database Section */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">Database</Label>
							<div className="grid grid-cols-3 gap-2">
								{AVAILABLE_CLUSTER_TYPES.map((type) => (
									<div
										key={type}
										className="flex items-center p-2 bg-muted/20 rounded border"
									>
										<div className="w-5 h-5 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
											<img
												src={
													CLUSTER_TYPE_ICON_MAP[
														type as keyof typeof CLUSTER_TYPE_ICON_MAP
													] || "https://dbprovider.bja.sealos.run/logo.svg"
												}
												alt={`${type} Icon`}
												width={20}
												height={20}
												className="rounded"
											/>
										</div>
										<span className="text-sm font-medium ml-2 truncate flex-1">
											{type}
										</span>
										<div className="flex items-center gap-1 ml-2">
											<Button
												variant="ghost"
												size="sm"
												className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
												onClick={() => handleDecrementDatabase(type)}
												disabled={databaseCounters[type] === 0}
											>
												<Minus className="h-3 w-3" />
											</Button>
											<span className="text-sm font-medium min-w-[20px] text-center">
												{databaseCounters[type]}
											</span>
											<Button
												variant="ghost"
												size="sm"
												className="h-4 w-4 p-0 hover:bg-primary hover:text-primary-foreground"
												onClick={() => handleIncrementDatabase(type)}
											>
												<Plus className="h-3 w-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* App Launchpad Section */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">App Launchpad</Label>

							{/* Existing apps */}
							{createdApps.length > 0 && (
								<div className="space-y-2">
									{createdApps.map((app, index) => (
										<div
											key={index}
											className="flex items-center p-2 py-1 bg-muted/20 rounded border"
										>
											{/* App image input on the left */}
											<div className="flex-shrink-0 min-w-32">
												<Input
													value={app.image}
													onChange={(e) => {
														const updated = [...createdApps];
														updated[index].image = e.target.value;
														setCreatedApps(updated);
													}}
													className="w-auto min-w-32 border-none shadow-none focus-visible:ring-0 bg-transparent! pl-0 text-sm"
													placeholder="Image (e.g., nginx:latest)"
													style={{
														width: `${Math.max(app.image.length * 8, 96)}px`,
													}}
												/>
											</div>

											{/* Ports in the middle */}
											<div className="flex-1 mx-2">
												<SimplePortList
													ports={app.ports?.map((p: any) => p.number) || []}
													allowEditing={true}
													onPortsChange={(portNumbers) => {
														const updated = [...createdApps];
														updated[index].ports = portNumbers.map((num) => ({
															number: num,
															publicAccess: true,
														}));
														setCreatedApps(updated);
													}}
												/>
											</div>

											{/* Delete button on the right */}
											<Button
												size="sm"
												variant="ghost"
												className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
												onClick={() => handleDeleteApp(index)}
											>
												<X className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							)}

							{/* Add new app */}
							<div
								className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-2 hover:border-muted-foreground/50 hover:bg-muted/20 transition-colors cursor-pointer"
								onClick={handleAddAppInline}
							>
								<div className="flex items-center justify-center gap-2">
									<Plus className="h-4 w-4 text-muted-foreground" />
									<span className="text-xs text-muted-foreground">
										Add new app
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Buttons */}
					<div className="flex gap-2">
						<Button variant="outline" onClick={handleCancel} className="flex-1">
							Cancel
						</Button>
						<Button
							onClick={handleConfirm}
							disabled={isCreating || !hasResources}
							className="flex-1"
						>
							{isCreating ? "Creating..." : "Create"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Runtime Selection Dialog */}
			<Dialog open={runtimeDialogOpen} onOpenChange={setRuntimeDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Select Runtime</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="grid grid-cols-5 gap-2">
							{DEVBOX_RUNTIMES.map((runtime) => (
								<div
									key={runtime}
									onClick={() => handleSelectRuntime(runtime)}
									className={`
                    flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all
                    hover:bg-muted/50 hover:border-primary/50
                    ${
											selectedRuntime === runtime
												? "border-primary bg-primary/10"
												: "border-border hover:border-primary/30"
										}
                  `}
								>
									<div className="w-6 h-6 flex items-center justify-center flex-shrink-0 bg-background-tertiary rounded">
										<img
											src={
												DEVBOX_RUNTIME_ICONS[runtime] ||
												"https://devbox.bja.sealos.run/logo.svg"
											}
											alt={`${runtime} Icon`}
											width={24}
											height={24}
											className="rounded"
										/>
									</div>
									<span className="text-sm font-medium leading-tight truncate">
										{runtime}
									</span>
								</div>
							))}
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
