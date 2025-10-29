"use client";

import { Settings } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type {
	App,
	Database,
	DevBox,
	ObjectStorageBucket,
	ProjectProposal,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
import { ProjectAppCard } from "./project-app-card";
import { ProjectBucketCard } from "./project-bucket-card";
import { ProjectDatabaseCard } from "./project-database-card";
import { ProjectDevBoxCard } from "./project-devbox-card";

interface ProjectProposalCardProps {
	proposal: ProjectProposal;
	onProposalUpdate?: (proposal: ProjectProposal) => void;
}

export function ProjectProposalCard({
	proposal,
	onProposalUpdate,
}: ProjectProposalCardProps) {
	const [internalProposal, setInternalProposal] =
		useState<ProjectProposal>(proposal);

	// Sync internal state when proposal prop changes
	useEffect(() => {
		setInternalProposal(proposal);
	}, [proposal]);

	// Generic update function for all resource types
	const updateResource = <
		T extends DevBox | Database | ObjectStorageBucket | App,
	>(
		resourceType: keyof ProjectProposal["resources"],
		index: number,
		updatedResource: T,
	) => {
		const newResources = [
			...(internalProposal.resources[resourceType] || []),
		] as T[];
		newResources[index] = updatedResource;
		const updatedProposal = {
			...internalProposal,
			resources: {
				...internalProposal.resources,
				[resourceType]: newResources,
			},
		};
		setInternalProposal(updatedProposal);
		// Also update the parent component if callback is provided
		if (onProposalUpdate) {
			onProposalUpdate(updatedProposal);
		}
	};

	const { resources } = internalProposal;

	// Define resource sections with their metadata
	const resourceSections: {
		title: string;
		key: keyof ProjectProposal["resources"];
		resources: any[];
		Component: React.ComponentType<{
			resource: any;
			onSave: (resource: any) => void;
		}>;
	}[] = [
		{
			title: "Development Environment",
			key: "devbox",
			resources: resources.devbox || [],
			Component: ProjectDevBoxCard,
		},
		{
			title: "Database",
			key: "database",
			resources: resources.database || [],
			Component: ProjectDatabaseCard,
		},
		{
			title: "Object Storage",
			key: "bucket",
			resources: resources.bucket || [],
			Component: ProjectBucketCard,
		},
		{
			title: "App Launchpad",
			key: "app",
			resources: resources.app || [],
			Component: ProjectAppCard,
		},
	];

	// Check if there are no resources
	const hasResources = resourceSections.some(
		(section) => section.resources.length > 0,
	);

	return (
		<div className="space-y-2">
			{hasResources ? (
				// Always use vertical layout (each resource in its own row)
				resourceSections.map(
					({ title, key, resources, Component }) =>
						resources.length > 0 && (
							<div key={key} className="space-y-2">
								{resources.map((resource, index) => (
									<Component
										key={`${key}-${index}`}
										resource={resource}
										onSave={(updatedResource: any) =>
											updateResource(key, index, updatedResource)
										}
									/>
								))}
							</div>
						),
				)
			) : (
				<div className="flex items-center justify-center py-12 text-muted-foreground">
					<div className="text-center">
						<Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No resources configured for this project</p>
					</div>
				</div>
			)}
		</div>
	);
}

export type {
	App,
	Database,
	DevBox,
	ObjectStorageBucket,
	ProjectProposal,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
