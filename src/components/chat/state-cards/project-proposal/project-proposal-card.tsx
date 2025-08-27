"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
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
  const updateDevBox = (index: number, updatedResource: DevBox) => {
    const newDevBoxes = [...(proposal.resources.devbox || [])];
    newDevBoxes[index] = updatedResource;
    const updatedProposal = {
      ...proposal,
      resources: {
        ...proposal.resources,
        devbox: newDevBoxes,
      },
    };
    if (onSave) {
      onSave(updatedProposal);
    }
  };

  const updateDatabase = (index: number, updatedResource: Database) => {
    const newDatabases = [...(proposal.resources.database || [])];
    newDatabases[index] = updatedResource;
    const updatedProposal = {
      ...proposal,
      resources: {
        ...proposal.resources,
        database: newDatabases,
      },
    };
    if (onSave) {
      onSave(updatedProposal);
    }
  };

  const updateBucket = (
    index: number,
    updatedResource: ObjectStorageBucket
  ) => {
    const newBuckets = [...(proposal.resources.bucket || [])];
    newBuckets[index] = updatedResource;
    const updatedProposal = {
      ...proposal,
      resources: {
        ...proposal.resources,
        bucket: newBuckets,
      },
    };
    if (onSave) {
      onSave(updatedProposal);
    }
  };

  const updateApp = (index: number, updatedResource: App) => {
    const newApps = [...(proposal.resources.app || [])];
    newApps[index] = updatedResource;
    const updatedProposal = {
      ...proposal,
      resources: {
        ...proposal.resources,
        app: newApps,
      },
    };
    if (onSave) {
      onSave(updatedProposal);
    }
  };

  const { name, resources } = proposal;

  // Group resources by type for display
  const devboxResources = resources.devbox || [];
  const databaseResources = resources.database || [];
  const bucketResources = resources.bucket || [];
  const appResources = resources.app || [];

  return (
    <Card
      className={`w-full max-w-3xl mx-auto ${className} bg-background-primary`}
    >
      <CardContent className="space-y-6">
        {/* Resources Preview */}
        <div className="space-y-4">
          {/* DevBox Resources Section */}
          {devboxResources.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-md font-medium flex items-center gap-2">
                  Development Environment
                  <Badge variant="secondary">{devboxResources.length}</Badge>
                </h4>
              </div>
              <div className="space-y-2">
                {devboxResources.map((resource, index) => (
                  <ProjectDevBoxCard
                    resource={resource}
                    onSave={(updatedResource) =>
                      updateDevBox(index, updatedResource)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Database Resources Section */}
          {databaseResources.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-md font-medium flex items-center gap-2">
                  Database Resources
                  <Badge variant="secondary">{databaseResources.length}</Badge>
                </h4>
              </div>
              <div className="space-y-2">
                {databaseResources.map((resource, index) => (
                  <ProjectDatabaseCard
                    key={index}
                    resource={resource}
                    onSave={(updatedResource) =>
                      updateDatabase(index, updatedResource)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Object Storage Resources Section */}
          {bucketResources.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-md font-medium flex items-center gap-2">
                  Object Storage Resources
                  <Badge variant="secondary">{bucketResources.length}</Badge>
                </h4>
              </div>
              <div className="space-y-2">
                {bucketResources.map((resource, index) => (
                  <ProjectBucketCard
                    key={index}
                    resource={resource}
                    onSave={(updatedResource) =>
                      updateBucket(index, updatedResource)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* App Resources Section */}
          {appResources.length > 0 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="text-md font-medium flex items-center gap-2">
                  Application Resources
                  <Badge variant="secondary">{appResources.length}</Badge>
                </h4>
              </div>
              <div className="space-y-2">
                {appResources.map((resource, index) => (
                  <ProjectAppCard
                    key={index}
                    resource={resource}
                    onSave={(updatedResource) =>
                      updateApp(index, updatedResource)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {devboxResources.length === 0 &&
            databaseResources.length === 0 &&
            bucketResources.length === 0 &&
            appResources.length === 0 && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No resources configured for this project</p>
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

// Export types for use in other components
export type {
  ProjectProposal,
  DevBox,
  Database,
  ObjectStorageBucket,
  App,
  Reliances,
} from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";
