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
import { DEVBOX_IDE } from "@/lib/sealos/resources/devbox/devbox-constant-a";
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
		Record<string, { isSuccess: boolean; isCorsRestricted?: boolean; checked?: boolean; embedAllowed?: boolean }>
	>({});

	const checkUrlStatus = async (url: string) => {
		try {
			const response = await fetch(
				`/api/check-url?url=${encodeURIComponent(url)}`,
			);
			const data = await response.json();

			setUrlStatuses((prev) => {
				const embedAllowed: boolean | undefined = typeof data.embedAllowed === "boolean" ? data.embedAllowed : undefined;
				const next = {
					...prev,
					[url]: {
						...prev[url],
						isSuccess: data.ok,
						embedAllowed,
						// If server told us about embedding, finalize the check immediately
						...(data.ok && typeof embedAllowed === "boolean"
							? {
								checked: true,
								isCorsRestricted: !embedAllowed,
							}
							: {}),
					},
				};
				return next;
			});
		} catch (error) {
			console.log(`URL check failed for ${url}, will retry...`, error);
			setUrlStatuses((prev) => ({
				...prev,
				[url]: {
					...prev[url],
					isSuccess: false,
				},
			}));
		}
	};

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

	const canAccessIFrame = (iframe: HTMLIFrameElement) => {
		try {
			// Deal with older browsers
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			// If we can access the document object at all, it's not CORS restricted
			// We just need to check if we can access any property without throwing an error
			if (doc) {
				// Try to access a property - if this doesn't throw, we have access
				// Using 'body' property as the test - it exists even if innerHTML is empty
				const testAccess = doc.body;
				console.log("Can access iframe document:", !!testAccess, "for URL:", iframe.src);
				return true;
			}
			console.log("No document found for iframe:", iframe.src);
			return false;
		} catch (error) {
			// Exception thrown - this indicates CORS restriction
			console.log("CORS restriction detected for iframe:", iframe.src, error);
			return false;
		}
	};

	const handleIframeLoad = (url: string, iframeRef: HTMLIFrameElement) => {
		// Test if we can actually access the iframe content
		// Use a timeout to ensure the iframe is fully loaded and DOM is ready
		setTimeout(() => {
			setUrlStatuses((prev) => {
				// If server provided a definitive embedAllowed, prefer that and do nothing here
				const serverEmbedAllowed = prev[url]?.embedAllowed;
				if (typeof serverEmbedAllowed === "boolean") {
					return {
						...prev,
						[url]: {
							...prev[url],
							checked: true,
							isCorsRestricted: !serverEmbedAllowed,
							isSuccess: true,
						},
					};
				}

				const accessAllowed = canAccessIFrame(iframeRef);
				return {
					...prev,
					[url]: {
						...prev[url],
						isSuccess: true,
						isCorsRestricted: !accessAllowed,
						checked: true, // Mark as checked to prevent further status checks
					},
				};
			});
		}, 300);
	};

	const handleIframeError = (url: string) => {
		// Iframe failed to load completely
		setUrlStatuses((prev) => ({
			...prev,
			[url]: {
				...prev[url],
				isSuccess: false,
				isCorsRestricted: false,
			},
		}));
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
					isCorsRestricted: false,
					checked: false,
				};
				const isSuccess = status.isSuccess;
				const isCorsRestricted = status.isCorsRestricted;
				const isChecked = status.checked;

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
							className="relative w-full cursor-pointer hover:opacity-90 transition-opacity"
							style={{
								aspectRatio:
									isSuccess && isChecked && !isCorsRestricted ? "16/9" : undefined,
								height: isSuccess && isChecked && !isCorsRestricted ? undefined : "100px",
							}}
							onClick={() => handleIframeClick(item.url)}
						>
							{isSuccess && isChecked && isCorsRestricted ? (
								<div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-muted/20 px-4">
									<span className="text-center text-sm text-muted-foreground">
										Application ready, preview blocked by CORS policy
									</span>
									<span className="text-center text-xs text-muted-foreground/70">
										Click to open the application
									</span>
								</div>
							) : isSuccess && isChecked && !isCorsRestricted ? (
								<iframe
									src={item.url}
									className="w-full h-full rounded-lg pointer-events-none"
									title="Resource Preview"
									allowFullScreen
									onLoad={(e) => handleIframeLoad(item.url, e.currentTarget)}
									onError={() => handleIframeError(item.url)}
								/>
							) : isSuccess && !isChecked ? (
								<>
									{/* Hidden iframe for accessibility checking */}
									<iframe
										src={item.url}
										className="w-full h-full rounded-lg pointer-events-none opacity-0 absolute inset-0"
										title="Resource Preview"
										allowFullScreen
										onLoad={(e) => handleIframeLoad(item.url, e.currentTarget)}
										onError={() => handleIframeError(item.url)}
									/>
									{/* Loading overlay */}
									<div className="w-full h-full rounded-lg bg-muted/20 flex items-center justify-center relative z-10">
										<TextShimmer
											as="div"
											className=""
											duration={1.5}
											spread={1.5}
										>
											Checking accessibility...
										</TextShimmer>
									</div>
								</>
							) : (
								<div className="w-full h-full rounded-lg bg-muted/20 flex items-center justify-center">
									<TextShimmer
										as="div"
										className=""
										duration={1.5}
										spread={1.5}
									>
										Initiating
									</TextShimmer>
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
