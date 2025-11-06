import { useInterval } from "@reactuses/core";
import { Check, CircleCheckBig, Copy } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { useFlowgraphState } from "@/contexts/flowgraph/flowgraph-context";
import { useResourceObjects } from "@/hooks/sealos/resource/use-resource-objects";
import { useCopy } from "@/hooks/use-copy";
import { createK8sContext, useDevboxContext } from "@/lib/auth/auth-utils";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { CustomResourceTargetSchema } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { convertResourceTypeToTarget } from "@/lib/k8s/k8s-method/k8s-utils";
import {
	DEVBOX_IDE,
	DEVBOX_IDE_ICON_MAP,
} from "@/lib/sealos/resources/devbox/devbox-constant-a";
import { getDevboxSshInfo } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { composeSshConnectionUri } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";

interface PreviewMessageProps {
	target?: CustomResourceTarget | BuiltinResourceTarget;
}

export const PreviewMessage: React.FC<PreviewMessageProps> = () => {
	// Get all nodes from flowgraph state
	const { nodes } = useFlowgraphState();

	// Context for devbox functionality
	const context = createK8sContext();
	const devboxContext = useDevboxContext();

	const getIdeIconUrl = (ide: string) => {
		// Check if there's a custom icon mapping for this IDE
		if (DEVBOX_IDE_ICON_MAP[ide]) {
			return DEVBOX_IDE_ICON_MAP[ide];
		}
		// Fall back to the default devbox icon URL
		return `https://devbox.${context.regionUrl}/images/ide/${ide}.svg`;
	};

	// Extract targets from network type nodes
	const networkTargets = nodes
		.filter((node) => node.type === "network" && node.data?.target)
		.map((node) => node.data.target);

	// Use resource objects hook with network targets
	const resourceObjects = useResourceObjects(networkTargets as any);

	// Extract public domains from ports of resource objects with resource type
	const websiteUrls = React.useMemo(() => {
		if (!resourceObjects.data || !Array.isArray(resourceObjects.data)) {
			return [];
		}

		const publicDomains: Array<{ url: string; resourceType: string }> = [];

		resourceObjects.data.forEach((resource: any) => {
			if (resource?.ports && Array.isArray(resource.ports)) {
				const resourceType = resource?.type || resource?.kind || "unknown";
				resource.ports.forEach((port: any) => {
					if (port?.publicAddress) {
						publicDomains.push({
							url: port.publicAddress,
							resourceType: resourceType.toLowerCase(),
						});
					}
				});
			}
		});

		return publicDomains;
	}, [resourceObjects.data]);

	// Check if any URL belongs to a devbox resource
	const hasDevboxResource = React.useMemo(() => {
		return websiteUrls.some((item) => item.resourceType === "devbox");
	}, [websiteUrls]);

	const { copyToClipboard, isCopied } = useCopy();
	const [urlStatuses, setUrlStatuses] = useState<
		Record<
			string,
			{
				isSuccess: boolean;
				checked?: boolean;
			}
		>
	>({});

	const checkUrlStatus = React.useCallback(
		async (url: string) => {
			try {
				const regionUrl = context.regionUrl;
				const params = new URLSearchParams({
					url,
					...(regionUrl && { regionUrl }),
				});
				const response = await fetch(`/api/check-url?${params.toString()}`, {
					cache: "no-store",
				});

				console.log(
					`[Preview] ${url}: Raw response status:`,
					response.status,
					response.ok,
				);

				if (!response.ok) {
					console.error(
						`[Preview] ${url}: HTTP error:`,
						response.status,
						response.statusText,
					);
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const responseText = await response.text();
				console.log(`[Preview] ${url}: Raw response text:`, responseText);

				let data: {
					ok: boolean;
					embedAllowed?: boolean;
					status?: number;
					isUpstreamError?: boolean;
				};
				try {
					data = JSON.parse(responseText) as typeof data;
				} catch (parseError) {
					console.error(
						`[Preview] ${url}: JSON parse error:`,
						parseError,
						"Response text:",
						responseText,
					);
					throw parseError;
				}

				console.log(`[Preview] ${url}: Parsed data:`, data);

				const canEmbed = Boolean(data.ok && data.embedAllowed);
				const timestamp = Date.now();

				console.log(`[Preview] ${url} [${timestamp}]: API Response:`, {
					ok: data.ok,
					embedAllowed: data.embedAllowed,
					canEmbed,
					willSetState: { isSuccess: canEmbed, checked: canEmbed },
				});

				setUrlStatuses((prev) => {
					const prevStatus = prev[url];
					const newState = {
						...prev,
						[url]: {
							isSuccess: canEmbed,
							checked: canEmbed,
						},
					};
					console.log(`[Preview] ${url} [${timestamp}]: State updated:`, {
						previous: prevStatus,
						new: newState[url],
						allStatuses: Object.keys(prev).length,
					});
					return newState;
				});
			} catch (error) {
				console.log(`[Preview] ${url}: Check failed, will retry...`, error);
				setUrlStatuses((prev) => ({
					...prev,
					[url]: {
						isSuccess: false,
						checked: false,
					},
				}));
			}
		},
		[context.regionUrl],
	);

	// Check all URL statuses every 3 seconds, but stop checking once marked as checked
	useInterval(
		() => {
			websiteUrls.forEach((item) => {
				const status = urlStatuses[item.url];
				// Only check if not yet checked
				if (!status?.checked) {
					checkUrlStatus(item.url);
				}
			});
		},
		3000,
		{ immediate: true },
	);

	const handleCopyUrl = (url: string) => {
		copyToClipboard(url, `preview-url-${url}`);
	};

	const handleIframeClick = (url: string) => {
		window.open(url, "_blank");
	};

	// Get devbox objects for IDE functionality
	const devboxObjects = React.useMemo(() => {
		if (!resourceObjects.data || !Array.isArray(resourceObjects.data)) {
			return [];
		}

		return resourceObjects.data.filter(
			(resource: any) =>
				(resource?.type || resource?.kind || "").toLowerCase() === "devbox",
		);
	}, [resourceObjects.data]);

	const handleIdeClick = async (ide: string, devboxObject: any) => {
		toast.info("Opening IDE...");
		try {
			const target = CustomResourceTargetSchema.parse(
				convertResourceTypeToTarget("devbox", devboxObject.name),
			);

			const token = await getDevboxSshInfo(devboxContext, target);

			if (devboxObject.ssh) {
				const sshUri = composeSshConnectionUri(
					ide,
					context,
					devboxObject.ssh,
					devboxObject.name,
					token,
				);
				window.location.href = sshUri;
			}
		} catch (error) {
			console.error("Failed to get SSH info:", error);
			toast.error("Failed to open IDE");
		}
	};

	// If no addresses available
	if (websiteUrls.length === 0) {
		return (
			<div className="w-full border rounded-lg p-1">
				<div className="flex items-center justify-center">
					<span className="text-muted-foreground">
						No public domain available
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full space-y-4">
			{websiteUrls.map((item) => {
				const status = urlStatuses[item.url] || {
					isSuccess: false,
					checked: false,
				};
				const isSuccess = status.isSuccess;
				const isChecked = status.checked;
				const renderTimestamp = Date.now();

				console.log(`[Preview] Rendering ${item.url} [${renderTimestamp}]:`, {
					status,
					isSuccess,
					isChecked,
					willShowIframe: isSuccess && isChecked,
					allStatuses: Object.keys(urlStatuses).length,
				});

				return (
					<div
						key={item.url}
						className="w-full border rounded-lg p-1 bg-background-secondary"
					>
						<div className="flex items-center justify-between gap-2 pb-1">
							<div className="flex items-center gap-2 flex-1 justify-center py-1">
								<div className="flex items-center gap-1">
									{isSuccess ? (
										<CircleCheckBig className="h-4 w-4 text-theme-green" />
									) : (
										<Spinner
											variant="ring"
											size={16}
											className="text-theme-yellow"
										/>
									)}
								</div>

								<button
									type="button"
									className={`cursor-pointer hover:underline transition-all font-mono text-sm ${
										isSuccess ? "text-foreground" : "text-muted-foreground"
									}`}
									onClick={() => handleIframeClick(item.url)}
								>
									{item.url}
								</button>

								<button
									type="button"
									onClick={() => handleCopyUrl(item.url)}
									className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
								>
									{isCopied(`preview-url-${item.url}`) ? (
										<Check className="h-4 w-4 text-theme-green" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						<button
							type="button"
							className="relative w-full cursor-pointer hover:opacity-90 transition-opacity overflow-hidden"
							style={{
								aspectRatio: isSuccess && isChecked ? "16/9" : undefined,
								height: isSuccess && isChecked ? undefined : "100px",
							}}
							onClick={() => handleIframeClick(item.url)}
						>
							{isSuccess && isChecked ? (
								<div className="rounded-lg overflow-hidden w-full h-full">
									<iframe
										src={item.url}
										className="rounded-lg"
										title="Resource Preview"
										style={{
											width: "1600px",
											height: "900px",
											transform: "scale(0.3)",
											transformOrigin: "left top",
											pointerEvents: "none",
										}}
										sandbox="allow-scripts allow-same-origin"
										onLoad={() =>
											console.log(`[Preview] Iframe loaded: ${item.url}`)
										}
									/>
								</div>
							) : (
								<div className="w-full h-full rounded-lg bg-muted/20 flex items-center justify-center">
									{isChecked ? (
										<span className="text-sm text-muted-foreground">
											Preview unavailable
										</span>
									) : (
										<TextShimmer
											as="div"
											className=""
											duration={1.5}
											spread={1.5}
										>
											Checking...
										</TextShimmer>
									)}
								</div>
							)}
						</button>
					</div>
				);
			})}

			{/* Devbox message - appears below URLs */}
			{hasDevboxResource && (
				<div className="pt-3 border-t">
					<p className="text-sm font-medium mb-3">
						You may now connect to IDE to start developing.
					</p>

					{/* IDE Icons */}
					<div className="grid grid-cols-3 gap-2">
						{DEVBOX_IDE.map((ide) => (
							<button
								key={ide}
								type="button"
								onClick={() => {
									// Use the first devbox object for IDE connection
									if (devboxObjects.length > 0) {
										handleIdeClick(ide, devboxObjects[0]);
									}
								}}
								className="flex items-center gap-2 p-2 hover:bg-muted rounded-md border border-border-primary overflow-hidden cursor-pointer"
								title={`Open ${ide}`}
							>
								<Image
									src={getIdeIconUrl(ide)}
									alt={`${ide} icon`}
									width={20}
									height={20}
									className="h-5 w-5"
								/>
								<span className="text-sm font-medium capitalize">{ide}</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default PreviewMessage;
