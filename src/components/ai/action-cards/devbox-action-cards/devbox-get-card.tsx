"use client";

import { useQuery } from "@tanstack/react-query";
import { getDevboxOptions } from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import type { DevboxInfo } from "@/lib/sealos/devbox/schemas";
import {
  Loader2,
  Play,
  Square,
  Trash2,
  Cpu,
  HardDrive,
  Calendar,
  Image,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useManageDevboxLifecycleMutation,
  useDeleteDevboxMutation,
} from "@/lib/sealos/devbox/devbox-method/devbox-mutation";
import { useState } from "react";
import { toast } from "sonner";

function getStatusVariant(status: string) {
  switch (status.toLowerCase()) {
    case "running":
      return "default";
    case "stopped":
      return "secondary";
    case "pending":
      return "outline";
    case "error":
      return "destructive";
    default:
      return "secondary";
  }
}

function formatMemory(memory: number) {
  if (memory >= 1024) {
    return `${(memory / 1024).toFixed(1)}GB`;
  }
  return `${memory}MB`;
}

export function DevboxGetCard({ data }: { data?: DevboxInfo }) {
  const context = createDevboxContext();
  const [isLoading, setIsLoading] = useState(false);
  const lifecycleMutation = useManageDevboxLifecycleMutation(context);
  const deleteMutation = useDeleteDevboxMutation(context);

  // Extract devbox name from passed data if it exists
  const targetName = data?.name;

  // Fetch fresh devbox data
  const { data: devboxData, isLoading: isDevboxLoading } = useQuery({
    ...getDevboxOptions(context, targetName!),
    enabled: !!targetName,
  });

  if (isDevboxLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading DevBox...</span>
      </div>
    );
  }

  // Check if the response contains an error (e.g., devbox not found)
  if (!devboxData?.data) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        DevBox {targetName} not found.
      </div>
    );
  }

  // Check if the data is an error response with status code 500
  if (
    devboxData.data &&
    "code" in devboxData.data &&
    devboxData.data.code === 500
  ) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        DevBox "{targetName}" was not found.
      </div>
    );
  }

  // Type guard to ensure we have valid devbox data
  if (!("name" in devboxData.data) || !("status" in devboxData.data)) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Invalid devbox data received.
      </div>
    );
  }

  const devbox = devboxData.data as DevboxInfo;
  const isRunning = devbox.status.toLowerCase() === "running";

  const handleLifecycleAction = async (action: "start" | "stop") => {
    setIsLoading(true);
    try {
      await lifecycleMutation.mutateAsync({
        devboxName: devbox.name,
        action,
      });
      toast.success(`DevBox ${action}ed successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} DevBox`);
      console.error(`Failed to ${action} devbox:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete DevBox "${devbox.name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync(devbox.name);
      toast.success("DevBox deleted successfully");
    } catch (error) {
      toast.error("Failed to delete DevBox");
      console.error("Failed to delete devbox:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border border-muted">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{devbox.name}</CardTitle>
          <Badge variant={getStatusVariant(devbox.status)} className="text-xs">
            {devbox.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resource Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-muted-foreground" />
            <span>{devbox.cpu} cores</span>
          </div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span>{formatMemory(devbox.memory)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {devbox.imageName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(devbox.createTime).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Network Info */}
        {devbox.networks && devbox.networks.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Networks</h4>
            <div className="space-y-1">
              {devbox.networks.slice(0, 2).map((network, index) => (
                <div key={index} className="text-xs text-muted-foreground">
                  {network.portName}: {network.port} ({network.protocol})
                </div>
              ))}
              {devbox.networks.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{devbox.networks.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {isRunning ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleLifecycleAction("stop")}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Square className="h-3 w-3 mr-1" />
              )}
              Pause
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleLifecycleAction("start")}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              Start
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
