// Third-party libraries
import { queryOptions } from "@tanstack/react-query";
import _ from "lodash";

// Next.js server actions
import { runParallelAction } from "next-server-actions-parallel";

// Kubernetes API queries
import {
	getBuiltinResource,
	getBuiltinResourceDirect,
	getCustomResource,
	getCustomResourceDirect,
	getEventsByPod,
	getEventsByPodDirect,
	getPodLogs,
	getPodLogsDirect,
	listBuiltinResources,
	// Direct server-side helpers to avoid spawning multiple Server Action POSTs
	listBuiltinResourcesDirect,
	listCustomResources,
	listCustomResourcesDirect,
	listEvents,
	listEventsDirect,
} from "../k8s-api/k8s-api-query";

// Kubernetes API schemas
import type { K8sApiContext } from "../k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
} from "../k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { ListAllResourcesResponseSchema } from "../k8s-api/k8s-api-schemas/req-res-schemas/res-list-schemas";

// Kubernetes constants
import { BUILTIN_RESOURCES } from "../k8s-constant/k8s-constant-builtin-resource";
import { CUSTOM_RESOURCES } from "../k8s-constant/k8s-constant-custom-resource";
import { buildQueryKey } from "../k8s-constant/k8s-constant-query-key";

// Utility functions
import {
	type BrainResourcesSimplified,
	convertAnnotationToResourceTargets,
} from "./k8s-utils";

// ============================================================================
// NON-OPTIONS FUNCTIONS (Core business logic)
// ============================================================================

/**
 * List all resources (both custom and builtin) in parallel.
 */
export const listAllResources = async (
	context: K8sApiContext,
	labelSelector?: string,
	builtinResourceTypes?: string[],
	customResourceTypes?: string[],
) => {
	// Filter builtin resources based on provided list
	const builtinResourcesToFetch = builtinResourceTypes
		? _.pick(BUILTIN_RESOURCES, builtinResourceTypes)
		: {};

	// Filter custom resources based on provided list
	const customResourcesToFetch = customResourceTypes
		? _.pick(CUSTOM_RESOURCES, customResourceTypes)
		: {};

	// console.log("builtinResourcesToFetch", builtinResourcesToFetch);
	// console.log("customResourcesToFetch", customResourcesToFetch);

	// Prepare builtin resource promises only if there are resources to fetch
	const builtinPromises = _.isEmpty(builtinResourcesToFetch)
		? []
		: _.map(builtinResourcesToFetch, (config, name) =>
				listBuiltinResourcesDirect(context, {
					type: "builtin",
					resourceType: config.resourceType,
					labelSelector,
				}).then((result) => [name, result]),
			);

	// Prepare custom resource promises only if there are resources to fetch
	// Handle 404 errors gracefully - if a CRD doesn't exist, return empty list
	const customPromises = _.isEmpty(customResourcesToFetch)
		? []
		: _.map(customResourcesToFetch, (config, name) =>
				listCustomResourcesDirect(context, {
					type: "custom",
					resourceType: config.resourceType,
					group: config.group,
					version: config.version,
					plural: config.plural,
					labelSelector,
				})
					.then((result) => [name, result])
					.catch((error) => {
						// Handle 404 errors gracefully - CRD might not exist in cluster
						if (
							error instanceof Error &&
							(error.message.includes("404") ||
								error.message.includes("HTTP-Code: 404") ||
								error.message.includes("not found"))
						) {
							console.warn(
								`Custom resource type ${name} (${config.group}/${config.version}/${config.plural}) not found in cluster, returning empty list`,
							);
							return [
								name,
								{
									apiVersion: `${config.group}/${config.version}`,
									kind: `${config.resourceType}List`,
									items: [],
								},
							];
						}
						// Re-throw other errors
						throw error;
					}),
			);

	// Execute all promises in parallel
	const [builtinResults, customResults] = await Promise.all([
		Promise.all(builtinPromises),
		Promise.all(customPromises),
	]);

	// console.log("builtinResults", builtinResults);
	// console.log("customResults", customResults);

	return ListAllResourcesResponseSchema.parse({
		builtin: _.fromPairs(builtinResults),
		custom: _.fromPairs(customResults),
	});
};

/**
 * Generic async function to get any resource (custom or builtin)
 */
export const getResource = async (
	context: K8sApiContext,
	target: CustomResourceTarget | BuiltinResourceTarget,
) => {
	if (target.type === "custom") {
		return await getCustomResourceDirect(context, target);
	}
	return await getBuiltinResourceDirect(context, target);
};

/**
 * List events in Kubernetes namespace
 */
export const listEventsQuery = async (
	context: K8sApiContext,
	target: BuiltinResourceTarget,
) => {
	return await listEventsDirect(context, target);
};

/**
 * Get events for a specific pod
 */
export const getEventsByPodQuery = async (
	context: K8sApiContext,
	podName: string,
) => {
	return await getEventsByPodDirect(context, podName);
};

/**
 * Get logs for a specific pod
 */
export const getPodLogsQuery = async (
	context: K8sApiContext,
	podName: string,
	options: {
		container?: string;
		tailLines?: number;
		follow?: boolean;
		previous?: boolean;
		sinceSeconds?: number;
		timestamps?: boolean;
	} = {},
) => {
	return await getPodLogsDirect(context, podName, options);
};

/**
 * List resources based on annotation data using batch processing
 * This is an optimized version that only fetches the resources listed in the annotation
 */
export const listAnnotationBasedResources = async (
	context: K8sApiContext,
	annotation: BrainResourcesSimplified,
	projectName: string,
) => {
	const { builtinTargets, customTargets } = convertAnnotationToResourceTargets(
		annotation,
		projectName,
	);

	// Batch process builtin resources
	const builtinPromises = builtinTargets.map(async ({ key, target }) => {
		try {
			const result = await listBuiltinResourcesDirect(context, target);
			return [key, result];
		} catch (error) {
			console.warn(
				`Failed to fetch builtin resources of type ${target.resourceType}:`,
				error,
			);
			return [key, { items: [] }];
		}
	});

	// Batch process custom resources
	const customPromises = customTargets.map(async ({ key, target }) => {
		try {
			const result = await listCustomResourcesDirect(context, target);
			return [key, result];
		} catch (error) {
			console.warn(
				`Failed to fetch custom resources of type ${target.resourceType}:`,
				error,
			);
			return [key, { items: [] }];
		}
	});

	const [builtinResults, customResults] = await Promise.all([
		Promise.all(builtinPromises),
		Promise.all(customPromises),
	]);

	return ListAllResourcesResponseSchema.parse({
		builtin: _.fromPairs(builtinResults),
		custom: _.fromPairs(customResults),
	});
};

// ============================================================================
// OPTIONS FUNCTIONS (React Query wrappers)
// ============================================================================

/**
 * Query options for listing custom resources
 */
export const listCustomResourcesOptions = (
	context: K8sApiContext,
	target: CustomResourceTarget,
) =>
	queryOptions({
		queryKey: buildQueryKey.listCustomResources(
			target.group,
			target.version,
			context.namespace,
			target.plural,
			target.labelSelector,
		),
		queryFn: async () => {
			const result = await runParallelAction(
				listCustomResources(context, target),
			);
			return result;
		},
		enabled:
			!!target.group &&
			!!target.version &&
			!!context.namespace &&
			!!target.plural &&
			!!context.kubeconfig,
	});

/**
 * Query options for getting a custom resource by name
 */
export const getCustomResourceOptions = (
	context: K8sApiContext,
	target: CustomResourceTarget,
) =>
	queryOptions({
		queryKey: buildQueryKey.getCustomResource(
			target.group,
			target.version,
			context.namespace,
			target.plural,
			target.name!,
		),
		queryFn: async () => {
			const result = await runParallelAction(
				getCustomResource(context, target),
			);
			return result;
		},
		enabled:
			!!target.group &&
			!!target.version &&
			!!context.namespace &&
			!!target.plural &&
			!!target.name &&
			!!context.kubeconfig,
	});

/**
 * Query options for listing builtin resources
 */
export const listBuiltinResourcesOptions = (
	context: K8sApiContext,
	target: BuiltinResourceTarget,
) =>
	queryOptions({
		queryKey: buildQueryKey.listBuiltinResources(
			target.resourceType,
			context.namespace,
			target.labelSelector,
		),
		queryFn: async () =>
			await runParallelAction(listBuiltinResources(context, target)),
		enabled:
			!!target.resourceType && !!context.namespace && !!context.kubeconfig,
	});

/**
 * Query options for getting a builtin resource by name
 */
export const getBuiltinResourceOptions = (
	context: K8sApiContext,
	target: BuiltinResourceTarget,
) =>
	queryOptions({
		queryKey: buildQueryKey.getBuiltinResource(
			target.resourceType,
			context.namespace,
			target.name!,
		),
		queryFn: async () =>
			await runParallelAction(getBuiltinResource(context, target)),
		enabled:
			!!target.resourceType &&
			!!context.namespace &&
			!!target.name &&
			!!context.kubeconfig,
	});

/**
 * Query options for listing all resources (both custom and builtin)
 */
export const listAllResourcesOptions = (
	context: K8sApiContext,
	labelSelector?: string,
	builtinResourceTypes?: string[],
	customResourceTypes?: string[],
) =>
	queryOptions({
		queryKey: ["resources", labelSelector],
		queryFn: async () => {
			const result = await listAllResources(
				context,
				labelSelector,
				builtinResourceTypes,
				customResourceTypes,
			);
			return result;
		},
		enabled: !!context.namespace && !!context.kubeconfig,
	});

/**
 * Generic query options for getting any resource (custom or builtin)
 */
export const getResourceOptions = (
	context: K8sApiContext,
	target: CustomResourceTarget | BuiltinResourceTarget,
) => {
	if (target.type === "custom") {
		return getCustomResourceOptions(context, target);
	}
	return getBuiltinResourceOptions(context, target);
};

/**
 * Generic query options for listing any resource (custom or builtin)
 */
export const listResourcesOptions = (
	context: K8sApiContext,
	target: CustomResourceTarget | BuiltinResourceTarget,
) => {
	if (target.type === "custom") {
		return listCustomResourcesOptions(context, target);
	}
	return listBuiltinResourcesOptions(context, target);
};

/**
 * Query options for fetching specific resources based on annotation data
 * This is an optimized version that only fetches the resources listed in the annotation
 */
export const listAnnotationBasedResourcesOptions = (
	context: K8sApiContext,
	annotation: BrainResourcesSimplified,
	projectName: string,
) =>
	queryOptions({
		queryKey: buildQueryKey.listAnnotationBasedResources(
			context.namespace,
			projectName,
			annotation,
		),
		queryFn: async () => {
			const result = await listAnnotationBasedResources(
				context,
				annotation,
				projectName,
			);
			return result;
		},
		enabled:
			!!context.namespace &&
			!!context.kubeconfig &&
			!!annotation &&
			!!projectName,
	});
