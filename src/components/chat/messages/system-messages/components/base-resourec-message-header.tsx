"use client";

import { Check, Copy } from "lucide-react";
import type React from "react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useCopy } from "@/hooks/use-copy";
import type {
	BuiltinResourceTarget,
	CustomResourceTarget,
} from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { getClusterIconUrl } from "@/lib/sealos/resources/cluster/cluster-method/cluster-utils";
import { getDevboxRuntimeIconUrl } from "@/lib/sealos/resources/devbox/devbox-method/devbox-utils";

interface BaseResourceMessageHeaderProps {
	target: CustomResourceTarget | BuiltinResourceTarget;
	headerSlot?: React.ReactNode;
}

export default function BaseResourceMessageHeader({
	target,
	headerSlot,
}: BaseResourceMessageHeaderProps) {
	const { resource } = useResourceStatus(target);
	const { copyToClipboard, isCopied } = useCopy();

	const getIconUrl = () => {
		switch (target.resourceType) {
			case "devbox":
				// Use getDevboxRuntimeIconUrl to get the icon URL
				if (resource && "image" in resource && resource.image) {
					return getDevboxRuntimeIconUrl(
						resource.image as string,
						"", // regionUrl is unused in the function, kept for backward compatibility
					);
				}
				return "https://devbox.bja.sealos.run/logo.svg";

			case "cluster": {
				// Use type from resource data or fallback to name
				const clusterType =
					resource && "type" in resource && resource.type
						? resource.type
						: target.name;
				return getClusterIconUrl(clusterType);
			}

			case "deployment":
			case "statefulset":
				return "https://applaunchpad.bja.sealos.run/logo.svg";

			case "objectstoragebucket":
				return "https://objectstorage.bja.sealos.run/logo.svg";

			default:
				return "https://sealos.run/logo.svg";
		}
	};

	const getResourceTypeLabel = () => {
		switch (target.resourceType) {
			case "devbox":
				return "Devbox";
			case "cluster":
				return "Database";
			case "deployment":
			case "statefulset":
				return "App Launchpad";
			default:
				return (
					target.resourceType.charAt(0).toUpperCase() +
					target.resourceType.slice(1)
				);
		}
	};

	const getDisplayName = () => {
		const name = target.name || "Unknown";
		const maxLength = 14;
		return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
	};

	const handleNameClick = () => {
		const fullName = target.name || "Unknown";
		copyToClipboard(fullName, "resource-name");
	};

	return (
		<div className="p-2 rounded-lg border">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 truncate font-medium flex-1 min-w-0">
					<div className="flex flex-col items-start">
						<span className="flex items-center gap-4">
							<img
								src={getIconUrl()}
								alt={`${target.resourceType} Icon`}
								width={24}
								height={24}
								className="rounded-lg h-9 w-9 flex-shrink-0 p-1 bg-background-tertiary"
							/>
							<span className="flex flex-col min-w-0">
								<span className="text-xs text-muted-foreground leading-none">
									{getResourceTypeLabel()}
								</span>
								<span
									className="text-foreground leading-tight truncate cursor-pointer hover:text-primary transition-colors flex items-center gap-1"
									onClick={handleNameClick}
									title="Click to copy resource name"
								>
									{getDisplayName()}
									{isCopied("resource-name") ? (
										<Check className="h-3 w-3 text-green-500" />
									) : (
										<Copy className="h-3 w-3 opacity-50" />
									)}
								</span>
							</span>
						</span>
					</div>
				</div>
				{headerSlot && <div className="flex-shrink-0">{headerSlot}</div>}
			</div>
		</div>
	);
}
