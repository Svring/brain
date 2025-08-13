"use client";

import { ProjectPlanWithStatus } from "@/contexts/langgraph/langgraph-schema";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

interface ProposingStageDetailProps {
  proposingData: ProjectPlanWithStatus;
  proposingStatus: "pending" | "active" | "completed";
}

export function ProposingStageDetail({ proposingData, proposingStatus }: ProposingStageDetailProps) {
  return (
    <div className="rounded-lg">
      {proposingData ? (
        <div className="h-full flex flex-col relative">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto pr-2 pb-16">
            <div className="space-y-4">
              {proposingData.name && (
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {proposingData.name}
                  </h3>
                  {proposingData.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {proposingData.description}
                    </p>
                  )}
                </div>
              )}

              {proposingData.resources && 
                (proposingData.resources.devboxes.length > 0 || 
                 proposingData.resources.databases.length > 0 || 
                 proposingData.resources.buckets.length > 0) && (
                <div>
                  <h4 className="font-medium mb-3">Resources</h4>
                  <div className="space-y-2">
                    {proposingData.resources.devboxes.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-sm">
                          <span className="text-muted-foreground">DevBox:</span>{" "}
                          <span className="font-medium">{proposingData.resources.devboxes[0].runtime}</span>
                          {proposingData.resources.devboxes[0].description && (
                            <span className="text-muted-foreground">
                              {" "}- {proposingData.resources.devboxes[0].description}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {proposingData.resources.databases.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-sm">
                          <span className="text-muted-foreground">Database:</span>{" "}
                          <span className="font-medium">{proposingData.resources.databases[0].type}</span>
                          {proposingData.resources.databases[0].description && (
                            <span className="text-muted-foreground">
                              {" "}- {proposingData.resources.databases[0].description}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {proposingData.resources.buckets.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-sm">
                          <span className="text-muted-foreground">Bucket:</span>{" "}
                          <span className="font-medium">{proposingData.resources.buckets[0].policy}</span>
                          {proposingData.resources.buckets[0].description && (
                            <span className="text-muted-foreground">
                              {" "}- {proposingData.resources.buckets[0].description}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed button at bottom right */}
          <div className="absolute bottom-2 right-2 p-3">
            <Button 
              size="sm"
              onClick={() => {
                // TODO: Implement create functionality
                console.log("Creating project:", proposingData.name);
              }}
            >
              Create Project
            </Button>
          </div>
        </div>
      ) : proposingStatus === "active" ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner variant="bars" size={32} className="mb-4" />
          <p className="text-sm text-muted-foreground">Generating project proposal...</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No project proposal data available
        </p>
      )}
    </div>
  );
}
