import { useInterval } from "@reactuses/core";
import { Check, CircleCheckBig, Copy } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
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
import { DEVBOX_IDE } from "@/lib/sealos/resources/devbox/devbox-constant-a";
import { getDevboxSshInfo } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import { composeSshConnectionUri } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";

interface PreviewMessageProps {
	target?: CustomResourceTarget | BuiltinResourceTarget;
}

export const PreviewMessage: React.FC<PreviewMessageProps> = ({ target }) => {
	// Get all nodes from flowgraph state
	const { nodes } = useFlowgraphState();

	// Context for devbox functionality
	const context = createK8sContext();
	const devboxContext = useDevboxContext();

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
		Record<string, { isSuccess: boolean }>
	>({});

	const checkUrlStatus = async (url: string) => {
		try {
			const response = await fetch(
				`/api/check-url?url=${encodeURIComponent(url)}`,
			);
			const data = await response.json();

			setUrlStatuses((prev) => ({
				...prev,
				[url]: {
					isSuccess: data.ok,
				},
			}));
		} catch (error) {
			console.log(`URL check failed for ${url}, will retry...`, error);
			setUrlStatuses((prev) => ({
				...prev,
				[url]: {
					isSuccess: false,
				},
			}));
		}
	};

	// Check all URL statuses every 3 seconds
	useInterval(
		() => {
			websiteUrls.forEach((item) => {
				checkUrlStatus(item.url);
			});
		},
		3000,
		{ immediate: true },
	);

	const handleCopyUrl = (url: string) => {
		copyToClipboard(url, `preview-url-${url}`);
	};

	const handleUrlClick = (url: string) => {
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
			<div className="w-full border rounded-lg p-4">
				<span className="text-muted-foreground">
					No public domain available
				</span>
			</div>
		);
	}

	// Calculate loading status
	const totalUrls = websiteUrls.length;
	const loadedUrls = Object.values(urlStatuses).filter(
		(status) => status.isSuccess,
	).length;
	const allLoaded = totalUrls > 0 && loadedUrls === totalUrls;
	const someLoaded = loadedUrls > 0;

	return (
		<div className="w-full border rounded-lg p-2">
			{/* Status hint */}
			<div>
				<p className="text-sm text-muted-foreground">
					{allLoaded
						? "All previews ready"
						: someLoaded
							? `Previews are loading, please wait (${loadedUrls}/${totalUrls})`
							: "Previews are loading, please wait"}
				</p>
			</div>

			<div>
				{websiteUrls.map((item, index) => {
					const status = urlStatuses[item.url] || {
						isSuccess: false,
					};

					return (
						<div key={item.url} className="flex items-center gap-3 py-2">
							{/* Status Icon */}
							<div className="flex-shrink-0">
								{status.isSuccess ? (
									<CircleCheckBig className="h-4 w-4 text-theme-green" />
								) : (
									<Spinner
										variant="ring"
										size={16}
										className="text-theme-yellow"
									/>
								)}
							</div>

							{/* URL */}
							<div className="flex-1 min-w-0">
								<button
									type="button"
									onClick={() => handleUrlClick(item.url)}
									className="text-left w-full"
								>
									<span className="font-mono text-sm text-foreground hover:underline transition-colors break-all cursor-pointer">
										{item.url}
									</span>
								</button>
							</div>

							{/* Copy Button */}
							<div className="flex-shrink-0">
								<button
									type="button"
									onClick={() => handleCopyUrl(item.url)}
									className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
								>
									{isCopied(`preview-url-${item.url}`) ? (
										<Check className="h-4 w-4 text-theme-green" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>
					);
				})}
			</div>

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
								<img
									src={`https://devbox.${context.regionUrl}/images/ide/${ide}.svg`}
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
