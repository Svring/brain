"use client";

import type React from "react";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import type { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { DevboxObjectSchema } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";

interface BasicInfoSectionProps {
	target: CustomResourceTarget;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
	target,
}) => {
	const { resource: devboxResource } = useResourceStatus(target);
	const parsedDevboxObject = devboxResource
		? DevboxObjectSchema.parse(devboxResource)
		: null;

	// Helper function to format image name (extract just the image name without full path)
	const getImageName = (image: string) => {
		if (!image) return "Unknown";
		const parts = image.split("/");
		return parts[parts.length - 1] || image;
	};

	// Helper function to format uptime (using status as a proxy for uptime info)
	const getUptime = (status: string) => {
		if (!status) return "Unknown";
		return status === "Running" ? "Active" : status;
	};

	return (
		<div className="p-2 border rounded-lg w-full min-w-0">
			<div className="flex gap-4 min-w-0">
				{/* Runtime */}
				<div className="flex-1 flex flex-col">
					<span className="font-medium text-sm">Runtime</span>
					<span className="text-xs text-muted-foreground truncate">
						{parsedDevboxObject?.image || "Unknown"}
					</span>
				</div>

				{/* Created At */}
				<div className="flex-1 flex flex-col">
					<span className="font-medium text-sm">Created</span>
					<span className="text-xs text-muted-foreground truncate">
						{parsedDevboxObject?.operationalStatus?.createdAt || "Unknown"}
					</span>
				</div>
			</div>
		</div>
	);
};

export default BasicInfoSection;
