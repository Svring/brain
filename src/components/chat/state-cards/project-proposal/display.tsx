"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import Image from "next/image";
import { CLUSTER_TYPE_ICON_MAP } from "@/lib/sealos/resources/cluster/cluster-constant/cluster-constant-icons";
import type { ProjectProposal } from "@/lib/brain/resources/project/project-schemas/project-proposal-schema";

interface ProjectProposalDisplayProps {
  proposal: ProjectProposal;
  className?: string;
}

export function ProjectProposalDisplay({
  proposal,
  className = "",
}: ProjectProposalDisplayProps) {
  const { name, description, resources } = proposal;

  // Group resources by type for display
  const devboxResources = resources.devbox || [];
  const databaseResources = resources.database || [];
  const bucketResources = resources.bucket || [];
  const appResources = resources.app || [];

  return (
    <Card className={`w-full max-w-3xl mx-auto ${className}`}>
      <CardContent className="space-y-6 pt-6">
        {/* Project Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{name}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Resources Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resources Overview</h3>

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
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src="https://devbox.bja.sealos.run/logo.svg"
                            alt="DevBox Icon"
                            width={36}
                            height={36}
                            className="rounded-lg h-9 w-9 flex-shrink-0"
                            priority
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs text-muted-foreground leading-none">
                            Development Environment
                          </span>
                          <span className="text-lg font-bold text-foreground leading-tight truncate">
                            {resource.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{resource.runtime}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-1 break-words">
                        {resource.description}
                      </p>
                      {resource.reliances && (
                        <div className="pl-1">
                          <div className="text-sm text-muted-foreground">
                            <strong>Dependencies:</strong>
                          </div>
                          {resource.reliances.database &&
                            resource.reliances.database.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                <strong>Database:</strong>{" "}
                                {resource.reliances.database.join(", ")}
                              </div>
                            )}
                          {resource.reliances.bucket &&
                            resource.reliances.bucket.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                <strong>Object Storage:</strong>{" "}
                                {resource.reliances.bucket.join(", ")}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </Card>
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
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src={
                              CLUSTER_TYPE_ICON_MAP[
                                resource.type as keyof typeof CLUSTER_TYPE_ICON_MAP
                              ] ||
                              "https://dbprovider.bja.sealos.run/logo.svg"
                            }
                            alt={`${resource.type} Icon`}
                            width={36}
                            height={36}
                            className="rounded-lg h-9 w-9 flex-shrink-0"
                            priority
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs text-muted-foreground leading-none">
                            Database
                          </span>
                          <span className="text-lg font-bold text-foreground leading-tight truncate">
                            {resource.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{resource.type}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-1 break-words">
                        {resource.description}
                      </p>
                    </div>
                  </Card>
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
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src="https://objectstorageapi.hzh.sealos.run/cyhipdvv-logos/objectstorage.svg"
                            alt="Object Storage Icon"
                            width={36}
                            height={36}
                            className="rounded-lg border border-muted h-9 w-9 flex-shrink-0"
                            priority
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs text-muted-foreground leading-none">
                            Object Storage
                          </span>
                          <span className="text-lg font-bold text-foreground leading-tight truncate">
                            {resource.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{resource.policy}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-1 break-words">
                        {resource.description}
                      </p>
                    </div>
                  </Card>
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
                  <Card key={index} className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Image
                            src="https://applaunchpad.bja.sealos.run/logo.svg"
                            alt="App Icon"
                            width={36}
                            height={36}
                            className="rounded-lg h-9 w-9 flex-shrink-0"
                            priority
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs text-muted-foreground leading-none">
                            Application
                          </span>
                          <span className="text-lg font-bold text-foreground leading-tight truncate">
                            {resource.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>App</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground pl-1 break-words">
                        {resource.description}
                      </p>
                      <p className="text-xs text-muted-foreground pl-1">
                        Image: {resource.image}
                      </p>
                      {resource.reliances && (
                        <div className="pl-1">
                          <div className="text-sm text-muted-foreground">
                            <strong>Dependencies:</strong>
                          </div>
                          {resource.reliances.database &&
                            resource.reliances.database.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                <strong>Database:</strong>{" "}
                                {resource.reliances.database.join(", ")}
                              </div>
                            )}
                          {resource.reliances.bucket &&
                            resource.reliances.bucket.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                <strong>Object Storage:</strong>{" "}
                                {resource.reliances.bucket.join(", ")}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  </Card>
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
