import { useQuery } from "@tanstack/react-query";
import { MarkerType } from "@xyflow/react";
import { useEffect, useMemo } from "react";
import { useAuthState } from "@/contexts/auth/auth-context";
import {
	useFlowgraphActions,
	useFlowgraphState,
} from "@/contexts/flowgraph/flowgraph-context";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import type { ResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";

export const useNetworkStatus = (target: ResourceTarget) => {
	const { devbox, launchpad } = useTRPCClients();
	const { edges } = useFlowgraphState();
	const { updateEdge } = useFlowgraphActions();
	const { resource } = useResourceStatus(target);
	const { auth } = useAuthState();

	const networkNodeId = `network-${resource?.name || target.name}`;
	const connectedEdges = useMemo(
		() =>
			edges.filter(
				(edge) =>
					edge.target === networkNodeId || edge.source === networkNodeId,
			),
		[edges, networkNodeId],
	);

	const isDevbox = target.type === "custom" && target.resourceType === "devbox";
	const { data: readyStatus } = useQuery({
		...(isDevbox
			? devbox.networkStatus.queryOptions(resource?.name)
			: launchpad.networkStatus.queryOptions(resource?.name)),
		enabled: !!(resource?.name || target.name),
		refetchInterval: 5000,
	});

	// Extract URLs from readyStatus for deeper checks
	const urls: string[] = useMemo(() => {
		if (!Array.isArray(readyStatus)) return [];
		return readyStatus
			.map((item: any) => item?.url)
			.filter((u: any) => typeof u === "string" && u.startsWith("http"));
	}, [readyStatus]);

	// Server-side URL checks to catch gateway 502 / upstream errors
	const { data: urlChecks } = useQuery({
		queryKey: ["urlChecks", networkNodeId, urls],
		queryFn: async () => {
			if (!urls.length || !auth?.regionUrl) return {} as Record<string, any>;
			const results = await Promise.all(
				urls.map(async (u) => {
					try {
						const res = await fetch(
							`/api/check-url?url=${encodeURIComponent(u)}&regionUrl=${encodeURIComponent(
								auth.regionUrl,
							)}`,
							{ method: "GET", cache: "no-store" },
						);
						const json = await res.json();
						return [u, json] as const;
					} catch {
						return [u, { ok: false, status: 503 }] as const;
					}
				}),
			);
			return Object.fromEntries(results);
		},
		enabled: urls.length > 0 && !!auth?.regionUrl,
		refetchInterval: 10000,
	});

	// Combine original readyStatus with urlChecks: mark upstream errors as not ready
	const combinedReadyStatus = useMemo(() => {
		if (!Array.isArray(readyStatus)) return readyStatus;
		if (!urlChecks) return readyStatus;
		return readyStatus.map((item: any) => {
			const check = urlChecks[item.url];
			if (!check) return item;
			const isUpstreamError = !!check.isUpstreamError || check.status === 502;
			if (isUpstreamError) {
				return {
					...item,
					ready: false,
					error: "Upstream service error - backend not responding",
				};
			}
			// If server says not ok (non-2xx/3xx), treat as not ready
			if (check.ok === false) {
				return {
					...item,
					ready: false,
					error: `HTTP ${check.status || "error"}`,
				};
			}
			return item;
		});
	}, [readyStatus, urlChecks]);

	const statusKey = useMemo(() => {
		if (!Array.isArray(combinedReadyStatus) || !combinedReadyStatus.length)
			return "unknown";
		const readyCount = combinedReadyStatus.filter(
			(item: any) => item.ready,
		).length;
		if (readyCount === 0) return "allNotReady";
		if (readyCount === combinedReadyStatus.length) return "allReady";
		return "partial";
	}, [combinedReadyStatus]);

	const getBackgroundColor = () =>
		statusKey === "allNotReady" || statusKey === "partial"
			? "bg-status-warning"
			: "";

	useEffect(() => {
		const desiredStroke = "#9F833B";
		const desiredMarker = {
			type: MarkerType.Arrow,
			width: 30,
			height: 30,
			color: desiredStroke,
		};

		connectedEdges.forEach((edge) => {
			const currentType = edge.type;

			if (statusKey === "allNotReady" || statusKey === "partial") {
				// Use error edge type for not ready or partial status
				if (currentType !== "floatingError") {
					updateEdge({
						...edge,
						type: "floatingError",
						markerEnd: desiredMarker,
					});
				}
			} else {
				// Use normal floating edge for ready status
				if (currentType !== "floating") {
					updateEdge({
						...edge,
						type: "floating",
						markerEnd: undefined,
					});
				}
			}
		});
	}, [statusKey, connectedEdges]);

	return { readyStatus: combinedReadyStatus, getBackgroundColor };
};
