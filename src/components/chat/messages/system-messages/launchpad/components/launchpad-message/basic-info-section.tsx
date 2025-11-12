"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Copy, Image, Pencil } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { LaunchpadUpdateForm } from "@/components/forms/launchpad/launchpad-update-form";
import { Button } from "@/components/ui/button";
import { useResourceStatus } from "@/hooks/sealos/resource/use-resource-status";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useCopy } from "@/hooks/use-copy";
import type { BuiltinResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { LaunchpadObjectSchema } from "@/lib/sealos/resources/launchpad/launchpad-object-schema";
import type { LaunchpadUpdateFormData } from "@/schemas/forms/launchpad/launchpad-update-form-schema";

interface BasicInfoSectionProps {
	target: BuiltinResourceTarget;
	onSectionClick?: () => void;
}

// Basic Info Popover Content Component
export const BasicInfoPopoverContent: React.FC<{
	target: BuiltinResourceTarget;
}> = ({ target }) => {
	const [isEditing, setIsEditing] = useState(false);
	const { resource: launchpadResource } = useResourceStatus(target);
	const parsedLaunchpadObject = launchpadResource
		? LaunchpadObjectSchema.parse(launchpadResource)
		: null;

	const queryClient = useQueryClient();
	const { launchpad } = useTRPCClients();
	const { copyToClipboard, isCopied } = useCopy();

	const updateLaunchpad = useMutation(launchpad.update.mutationOptions());

	const handleFormSubmit = useCallback(
		async (data: LaunchpadUpdateFormData) => {
			try {
				// Filter to only include name and image fields
				const filteredData = {
					name: data.name,
					image: data.image,
				};
				await updateLaunchpad.mutateAsync(filteredData, {
					onSuccess: () => {
						queryClient.invalidateQueries({
							queryKey: launchpad.get.queryKey(target),
						});
						toast.success("Launchpad updated successfully!");
						setIsEditing(false);
					},
					onError: () => {
						toast.error("Failed to update launchpad");
					},
				});
			} catch (error) {
				console.error("Error updating launchpad image:", error);
			}
		},
		[updateLaunchpad, queryClient, launchpad, target],
	);

	// Memoize the form content to prevent unnecessary re-renders
	const formContent = useMemo(
		() => (
			<LaunchpadUpdateForm
				key={`basic-info-edit-${target.name}`}
				defaultValues={{
					name: parsedLaunchpadObject?.name || target.name!,
					image: {
						imageName: parsedLaunchpadObject?.image?.imageName || "",
						imageRegistry: parsedLaunchpadObject?.image?.imageRegistry || null,
					},
				}}
				onSubmit={handleFormSubmit}
				isLoading={updateLaunchpad.isPending}
				hideDefaultButton={true}
			/>
		),
		[
			parsedLaunchpadObject?.name,
			parsedLaunchpadObject?.image?.imageName,
			parsedLaunchpadObject?.image?.imageRegistry,
			target.name,
			updateLaunchpad.isPending,
		],
	);

	// Helper function to format image name (extract just the image name without full path)
	const getImageName = (image: string) => {
		if (!image) return "Unknown";
		const parts = image.split("/");
		return parts[parts.length - 1] || image;
	};

	if (isEditing) {
		return (
			<div className="w-full rounded-lg">
				<div className="space-y-3">{formContent}</div>

				{/* Cancel and Confirm Buttons - Fixed at bottom */}
				<div className="flex gap-2 mt-3 pt-3 border-t">
					<Button
						variant="outline"
						size="sm"
						className="flex-1"
						onClick={() => setIsEditing(false)}
						disabled={updateLaunchpad.isPending}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="launchpad-update-form"
						variant="default"
						size="sm"
						className="flex-1"
						disabled={updateLaunchpad.isPending}
					>
						{updateLaunchpad.isPending ? "Updating..." : "Confirm"}
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full rounded-lg space-y-3">
			{/* Image Display */}
			<div className="flex items-center justify-around">
				{/* Image Name */}
				<div className="flex flex-col items-center gap-1">
					<div className="text-sm text-muted-foreground">Image</div>
					<div className="flex items-center gap-1">
						<span
							className="text-xs truncate"
							title={getImageName(
								parsedLaunchpadObject?.image?.imageName || "",
							)}
						>
							{(() => {
								const name = getImageName(
									parsedLaunchpadObject?.image?.imageName || "",
								);
								return name.length > 16 ? name.slice(0, 16) + "..." : name;
							})()}
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-3 w-3 p-0 hover:bg-muted"
							onClick={() => {
								const imageName = parsedLaunchpadObject?.image?.imageName || "";
								if (imageName) {
									copyToClipboard(imageName, `image-${target.name}`);
									toast.success("Image name copied to clipboard");
								}
							}}
						>
							{isCopied(`image-${target.name}`) ? (
								<Check className="h-2 w-2 text-green-600" />
							) : (
								<Copy className="h-2 w-2" />
							)}
						</Button>
					</div>
				</div>

				{/* Created At */}
				<div className="flex flex-col items-center gap-1">
					<div className="text-sm text-muted-foreground">Created</div>
					<div className="text-sm font-medium">
						{parsedLaunchpadObject?.operationalStatus?.createdAt || "Unknown"}
					</div>
				</div>
			</div>

			{/* Edit Button - Full Row */}
			<div className="w-full flex">
				<Button
					variant="outline"
					size="sm"
					className="flex-1"
					onClick={() => setIsEditing(true)}
				>
					Edit Image
				</Button>
			</div>
		</div>
	);
};

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
	target,
	onSectionClick,
}) => {
	const { resource: launchpadResource } = useResourceStatus(target);
	const parsedLaunchpadObject = launchpadResource
		? LaunchpadObjectSchema.parse(launchpadResource)
		: null;

	// Helper function to format image name (extract just the image name without full path)
	const getImageName = (image: string) => {
		if (!image) return "Unknown";
		const parts = image.split("/");
		return parts[parts.length - 1] || image;
	};

	return (
		<div
			className={`p-2 border rounded-lg w-full min-w-0 ${
				onSectionClick
					? "cursor-pointer hover:bg-background-tertiary transition-colors"
					: ""
			}`}
			onClick={onSectionClick}
		>
			<div className="flex gap-4 min-w-0">
				{/* Image */}
				<div className="flex-1 flex items-center gap-2">
					<Image className="h-5 w-5 text-primary" />
					<div className="flex flex-col">
						<span className="font-medium text-sm">Image</span>
						<span
							className="text-xs text-muted-foreground truncate"
							title={getImageName(
								parsedLaunchpadObject?.image?.imageName || "",
							)}
						>
							{(() => {
								const name = getImageName(
									parsedLaunchpadObject?.image?.imageName || "",
								);
								return name.length > 16 ? name.slice(0, 16) + "..." : name;
							})()}
						</span>
					</div>
				</div>

				{/* Created At */}
				<div className="flex-1 flex items-center gap-2">
					<Calendar className="h-5 w-5 text-primary" />
					<div className="flex flex-col">
						<span className="font-medium text-sm">Created</span>
						<span className="text-xs text-muted-foreground truncate">
							{parsedLaunchpadObject?.operationalStatus?.createdAt || "Unknown"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BasicInfoSection;
