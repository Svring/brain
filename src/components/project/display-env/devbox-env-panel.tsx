"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreeView } from "@/components/ui/tree-view";
import { listDevboxFolderFilesOptions } from "@/lib/sealos/resources/devbox/devbox-method/devbox-query";
import type { DevboxObject } from "@/lib/sealos/resources/devbox/devbox-schemas/devbox-object-schema";
import { useProjectState } from "@/contexts/project/project-context";

interface DevboxEnvPanelProps {
  devboxResources: DevboxObject[];
}

export default function DevboxEnvPanel({
  devboxResources,
}: DevboxEnvPanelProps) {
  // Fetch files for each devbox resource
  const devboxFilesQueries = devboxResources.map((devbox: DevboxObject) => {
    return useQuery(listDevboxFolderFilesOptions(devbox.ssh, ""));
  });

  if (devboxResources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Devbox Files</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No devbox resources found in the selected project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Devbox Files</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {devboxResources.map((devbox: DevboxObject, index: number) => {
            const query = devboxFilesQueries[index];
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-medium text-lg">{devbox.name}</h3>
                  <Badge variant="secondary">{devbox.kind}</Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  Working Directory: {devbox.ssh.workingDir}
                </div>

                {query.isLoading ? (
                  <div className="text-muted-foreground text-sm">
                    Loading files...
                  </div>
                ) : query.error ? (
                  <div className="text-red-500 text-sm">
                    Error loading files: {query.error.message}
                  </div>
                ) : query.data ? (
                  <div className="text-sm">
                    <div className="font-medium mb-2">Files found:</div>
                    <div className="max-w-xl mx-auto w-full">
                      <TreeView
                        data={query.data}
                        onNodeClick={(node) =>
                          console.log("Clicked:", node.label)
                        }
                        defaultExpandedIds={query.data.map(
                          (file: any) => file.id
                        )}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">
                    No files loaded
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
