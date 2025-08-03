"use client";

import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import BaseNode from "../base-node-wrapper";
import { ArrowBigUpDash, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getDevboxReleasesOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { createDevboxContext } from "@/lib/auth/auth-utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DevboxNodeReleaseProps {
  target: CustomResourceTarget;
  nodeData: any;
}

export default function DevboxNodeRelease({
  target,
  nodeData,
}: DevboxNodeReleaseProps) {
  const devboxContext = createDevboxContext();
  const devboxName = target.name || "";

  const { data: releases, isLoading } = useQuery(
    getDevboxReleasesOptions(devboxContext, devboxName)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <BaseNode target={target} nodeData={{}}>
      <div className="flex h-full flex-col gap-3 p-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowBigUpDash className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Releases</span>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              // Add create release functionality here
            }}
            size="sm"
            variant="outline"
            className="h-7 px-2"
          >
            <ArrowBigUpDash className="h-3 w-3 mr-1" />
            New
          </Button>
        </div>

        {/* Releases List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="text-xs text-muted-foreground">Loading...</div>
            </div>
          ) : releases?.data && releases.data.length > 0 ? (
            <div className="space-y-2">
              {releases.data.map((release) => (
                <div
                  key={release.id}
                  className="border rounded-lg p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium truncate">
                          {release.tag}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs h-4 px-1 ${getStatusColor(
                            release.status.value
                          )}`}
                        >
                          {release.status.label}
                        </Badge>
                      </div>
                      {release.description && (
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {release.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(release.createTime)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <ArrowBigUpDash className="h-6 w-6 text-muted-foreground mb-2" />
              <div className="text-xs text-muted-foreground">
                No releases yet
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </BaseNode>
  );
}
