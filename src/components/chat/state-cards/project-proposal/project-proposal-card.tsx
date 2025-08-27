"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Sparkles } from "lucide-react";
import { ProjectDevBoxCard } from "./project-devbox-card";
import { ProjectDatabaseCard } from "./project-database-card";
import { ProjectBucketCard } from "./project-bucket-card";
import { ProjectAppCard } from "./project-app-card";
import type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface ProjectProposalCardProps {
  proposal: ProjectProposal;
  className?: string;
  onSave?: (updatedProposal: ProjectProposal) => void;
}

export function ProjectProposalCard({
  proposal,
  className = "",
  onSave,
}: ProjectProposalCardProps) {
  const [internalProposal, setInternalProposal] =
    useState<ProjectProposal>(proposal);

  // Generic update function for all resource types
  const updateResource = <
    T extends DevBox | Database | ObjectStorageBucket | App
  >(
    resourceType: keyof ProjectProposal["resources"],
    index: number,
    updatedResource: T
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
    onSave?.(updatedProposal);
  };

  // Handle project creation
  const handleCreate = () => {
    console.log("Creating project with proposal:", internalProposal);
    // Here you would typically:
    // 1. Validate the proposal
    // 2. Call your project creation API
    // 3. Handle success/error states
    // 4. Navigate to the created project or show success message

    // For now, we'll just log the proposal data
    // In a real implementation, you might want to:
    // - Show a loading state
    // - Call an API endpoint
    // - Handle errors
    // - Show success feedback
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
    (section) => section.resources.length > 0
  );

  return (
    <Card
      className={`w-full max-w-3xl mx-auto bg-background-primary rounded-xl ${className}`}
    >
      <CardContent className="space-y-6">
        {hasResources ? (
          resourceSections.map(
            ({ title, key, resources, Component }) =>
              resources.length > 0 && (
                <div key={key} className="space-y-3">
                  <h4 className="text-md font-medium flex items-center gap-2">
                    {title}
                    <Badge variant="secondary">{resources.length}</Badge>
                  </h4>
                  <div className="space-y-2">
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
                </div>
              )
          )
        ) : (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No resources configured for this project</p>
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleCreate}
            className="flex items-center"
          >
            <Sparkles className="h-4 w-4 text-theme-blue" />
            Create
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
  Reliances,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
