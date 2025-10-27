import axios from "axios";
import _ from "lodash";
import { runParallelAction } from "next-server-actions-parallel";
import type { z } from "zod";
import { PROJECT_DISPLAY_NAME_ANNOTATION_KEY } from "@/lib/brain/resources/project/project-constant/project-constant-annotation";
import { convertInstanceToProject } from "@/lib/brain/resources/project/project-method/project-utils";
import type { ProjectObjectSchema } from "@/lib/brain/resources/project/project-schemas/project-object-schema";
import {
	deleteBuiltinResource,
	deleteCustomResource,
	patchBuiltinResourceMetadata,
	patchCustomResourceMetadata,
	removeBuiltinResourceMetadata,
	removeCustomResourceMetadata,
	upsertCustomResource,
} from "@/lib/k8s/k8s-api/k8s-api-mutation";
import type { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import {
	type BuiltinResourceTarget,
	type CustomResourceTarget,
	CustomResourceTargetSchema,
	type ResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { INSTANCE_RELATE_RESOURCE_LABELS } from "@/lib/k8s/k8s-constant/k8s-constant-label";
import { listAllResources } from "@/lib/k8s/k8s-method/k8s-query";
import {
	convertResourceToTarget,
	convertResourceTypeToTarget,
	flattenListAllResourcesResponse,
} from "@/lib/k8s/k8s-method/k8s-utils";
import { deleteClusterService } from "@/lib/sealos/resources/cluster/cluster-api/cluster-api-service";
import { getClusterLogs } from "@/lib/sealos/resources/cluster/cluster-method/cluster-query";
import { deleteDevbox } from "@/lib/sealos/resources/devbox/devbox-api/devbox-api-service";
import { deleteLaunchpadService } from "@/lib/sealos/resources/launchpad/launchpad-api/launchpad-api-service";
import { getLaunchpadLogs } from "@/lib/sealos/resources/launchpad/launchpad-method/launchpad-query";
import { deleteObjectStorageBucket } from "@/lib/sealos/resources/objectstorage/objectstorage-api/objectstorage-api-service";
import type { SealosApiContext } from "@/lib/sealos/sealos-api-context-schema";

/**
 * Get all logs for project resources (clusters and launchpads)
 */
export async function getAllProjectLogs(
	k8sContext: K8sApiContext,
	sealosContext: SealosApiContext,
	request: {
		clusterResources: { name: string; kind: string }[];
		launchpadResources: { name: string; kind: string }[];
	},
): Promise<{
	logs: { name: string; kind: string; logs: any }[];
}> {
	const allLogs: { name: string; kind: string; logs: any }[] = [];

	// Get cluster logs
	for (const clusterResource of request.clusterResources) {
		try {
			const target = convertResourceTypeToTarget(
				"cluster",
				clusterResource.name,
			) as CustomResourceTarget;
			const clusterLogs = await getClusterLogs(
				k8sContext,
				sealosContext,
				target,
			);
			allLogs.push({
				name: clusterResource.name,
				kind: clusterResource.kind,
				logs: clusterLogs,
			});
		} catch (error) {
			console.error(
				`Failed to get logs for cluster ${clusterResource.name}:`,
				error,
			);
			allLogs.push({
				name: clusterResource.name,
				kind: clusterResource.kind,
				logs: {
					error: `Failed to fetch logs: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				},
			});
		}
	}

	// Get launchpad logs
	for (const launchpadResource of request.launchpadResources) {
		try {
			// Try to determine the actual resource type from the node data
			const resourceType =
				(launchpadResource as any).resourceType || "deployment";
			const target = convertResourceTypeToTarget(
				resourceType,
				launchpadResource.name,
			) as BuiltinResourceTarget;
			const launchpadLogs = await getLaunchpadLogs(
				k8sContext,
				sealosContext,
				target,
			);
			allLogs.push({
				name: launchpadResource.name,
				kind: launchpadResource.kind,
				logs: launchpadLogs,
			});
		} catch (error) {
			console.error(
				`Failed to get logs for launchpad ${launchpadResource.name}:`,
				error,
			);
			allLogs.push({
				name: launchpadResource.name,
				kind: launchpadResource.kind,
				logs: {
					error: `Failed to fetch logs: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				},
			});
		}
	}

	return { logs: allLogs };
}

/**
 * Get all resources for a project
 */
export async function getProjectResources(
	k8sContext: K8sApiContext,
	request: { name: string },
): Promise<{
	targets: ResourceTarget[];
	resources: any[];
}> {
	const { name } = request;

	// Create label selector for the project
	const labelSelector = `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${name}`;

	// Get all resources using the new approach
	const allResourcesResponse = await listAllResources(
		k8sContext,
		labelSelector,
		["deployment", "statefulset"], // builtin resource types
		["devbox", "cluster", "objectstoragebucket"], // custom resource types
	);

	// Flatten the response and convert to targets
	const flattened = flattenListAllResourcesResponse(allResourcesResponse);
	const targets = flattened.map(convertResourceToTarget).filter(Boolean);

	return {
		targets: targets,
		resources: flattened, // Return raw K8s resources
	};
}

/**
 * Create a new project
 */
export async function createProject(
	k8sContext: K8sApiContext,
	request: { name: string },
): Promise<{
	project: z.infer<typeof ProjectObjectSchema>;
}> {
	const { name } = request;
	const target = CustomResourceTargetSchema.parse(
		convertResourceTypeToTarget("instance", name),
	);
	const resourceBody = {
		apiVersion: "app.sealos.io/v1",
		kind: "Instance",
		metadata: {
			name,
			namespace: k8sContext.namespace,
			labels: {
				[INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS]: name,
			},
		},
		spec: {
			templateType: "inline",
			defaults: {
				app_name: {
					type: "string",
					value: name,
				},
			},
			title: name,
		},
	};

	const instanceResource = await runParallelAction(
		upsertCustomResource(k8sContext, target, resourceBody),
	);

	const project = convertInstanceToProject(instanceResource);
	if (!project) {
		throw new Error("Failed to create project");
	}
	return { project };
}

/**
 * Delete a project and all its resources
 */
export async function deleteProject(
	k8sContext: K8sApiContext,
	sealosContext: SealosApiContext,
	request: { name: string },
): Promise<{
	name: string;
	success: boolean;
}> {
	const { name } = request;
	// 1. Get all resources related to the project using the new approach
	const labelSelector = `${INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS}=${name}`;
	const allResourcesResponse = await listAllResources(
		k8sContext,
		labelSelector,
		["deployment", "statefulset"], // builtin resource types
		["devbox", "cluster", "objectstoragebucket", "instance", "app"], // custom resource types including instance
	);

	// 2. Flatten and convert to targets
	const flattened = flattenListAllResourcesResponse(allResourcesResponse);
	const targets = flattened.map(convertResourceToTarget).filter(Boolean);

	// 3. Delete all found resources
	const deletePromises: Promise<any>[] = [];

	for (const target of targets) {
		switch (target.type) {
			case "custom":
				switch (target.resourceType) {
					case "devbox":
						deletePromises.push(deleteDevbox(sealosContext, target.name!));
						break;
					case "cluster":
						deletePromises.push(
							deleteClusterService(
								sealosContext,
								convertResourceTypeToTarget(
									"cluster",
									target.name!,
								) as CustomResourceTarget,
							),
						);
						break;
					case "objectstoragebucket":
						deletePromises.push(
							deleteObjectStorageBucket(sealosContext, {
								bucketName: target.name!,
							}),
						);
						break;
					default:
						deletePromises.push(deleteCustomResource(k8sContext, target));
				}
				break;
			case "builtin":
				switch (target.resourceType) {
					case "deployment":
						deletePromises.push(
							deleteLaunchpadService(sealosContext, { name: target.name! }),
						);
						break;
					case "statefulset":
						deletePromises.push(
							deleteLaunchpadService(sealosContext, { name: target.name! }),
						);
						break;
					default:
						deletePromises.push(deleteBuiltinResource(k8sContext, target));
				}
				break;
		}
	}

	await Promise.allSettled(deletePromises);

	return { name, success: true };
}

// export async function deleteProject(
// 	k8sContext: K8sApiContext,
// 	request: { name: string },
// ): Promise<{
// 	name: string;
// 	success: boolean;
// }> {
// 	const serviceSubdomain = "template";
// 	const baseURL = `https://${serviceSubdomain}.${k8sContext.regionUrl}/api/v1/instance`;

// 	const api = axios.create({
// 		baseURL,
// 		headers: {
// 			"Content-Type": "application/json",
// 			Authorization: encodeURIComponent(k8sContext.kubeconfig),
// 		},
// 	});
// 	const response = await api.delete(`/${request.name}`, {});
// 	return response.data;
// }

/**
 * Add resources to a project
 */
export async function addResourcesToProject(
	k8sContext: K8sApiContext,
	request: {
		resources: ResourceTarget[];
		name: string;
	},
): Promise<{
	success: boolean;
}> {
	const { resources, name } = request;

	// Add labels to all resources
	for (const resource of resources) {
		if (resource.type === "custom") {
			await patchCustomResourceMetadata(
				k8sContext,
				resource,
				"labels",
				INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
				name,
			);
		} else {
			await patchBuiltinResourceMetadata(
				k8sContext,
				resource,
				"labels",
				INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
				name,
			);
		}
	}

	return { success: true };
}

/**
 * Remove resources from a project
 */
export async function removeResourcesFromProject(
	k8sContext: K8sApiContext,
	request: {
		resources: ResourceTarget[];
	},
): Promise<{
	success: boolean;
}> {
	const { resources } = request;

	// Remove project label from all resources
	for (const resource of resources) {
		if (resource.type === "custom") {
			await removeCustomResourceMetadata(
				k8sContext,
				resource,
				"labels",
				INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
			);
		} else {
			// Type assertion for builtin resources
			const builtinResource = resource as any;
			await removeBuiltinResourceMetadata(
				k8sContext,
				builtinResource,
				"labels",
				INSTANCE_RELATE_RESOURCE_LABELS.DEPLOY_ON_SEALOS,
			);
		}
	}

	return { success: true };
}

/**
 * Update project display name
 */
export async function updateProjectName(
	k8sContext: K8sApiContext,
	request: {
		name: string;
		newDisplayName: string;
	},
): Promise<{
	name: string;
	newDisplayName: string;
}> {
	const { name, newDisplayName } = request;
	const target = CustomResourceTargetSchema.parse(
		convertResourceTypeToTarget("instance", name),
	);

	await patchCustomResourceMetadata(
		k8sContext,
		target,
		"annotations",
		PROJECT_DISPLAY_NAME_ANNOTATION_KEY,
		newDisplayName,
	);

	return {
		name,
		newDisplayName,
	};
}
