"use client";

import { useQuery } from "@tanstack/react-query";
import {
  listDevboxOptions,
  getDevboxOptions,
} from "@/lib/sealos/devbox/devbox-method/devbox-query";
import { getDevboxByName } from "@/lib/sealos/devbox/devbox-api/devbox-open-api";
import { runParallelAction } from "next-server-actions-parallel";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import { DataTable } from "@/components/inventory/devbox-inventory/devbox-table";
import { columns } from "@/components/inventory/devbox-inventory/devbox-table-columns";
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

export function DevboxListCard({ devboxList }: { devboxList: any }) {
  const context = createDevboxContext();

  // Fetch fresh devbox list data
  const { data: listData, isLoading: isListLoading } = useQuery(
    listDevboxOptions(context)
  );

  // Fetch detailed data for each devbox
  const devboxNames = listData?.data?.map((item) => item.name) || [];

  const devboxQueries = useQuery({
    queryKey: ["sealos", "devbox", devboxNames],
    queryFn: async () => {
      if (!devboxNames.length) return [];

      const promises = devboxNames.map((name) =>
        runParallelAction(getDevboxByName(name, context))
      );

      const results = await Promise.allSettled(promises);
      return results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value.data);
    },
    enabled: !!devboxNames.length,
  });

  if (isListLoading || devboxQueries.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading DevBoxes...</span>
      </div>
    );
  }

  if (!devboxQueries.data?.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No DevBoxes found.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg p-4 border border-muted">
      <h3 className="text-lg font-semibold mb-4">DevBox List</h3>
      <DataTable<DevboxInfo, any>
        columns={columns}
        data={devboxQueries.data as DevboxInfo[]}
      />
    </div>
  );
}

export function DevboxCard({ data }: { data?: DevboxInfo }) {
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

  const handleLifecycleAction = async (action: "start" | "stop") => {
    if (!devboxData?.data) return;

    setIsLoading(true);
    try {
      await lifecycleMutation.mutateAsync({
        devboxName: devboxData.data.name,
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
    if (!devboxData?.data) return;

    if (
      !confirm(
        `Are you sure you want to delete DevBox "${devboxData.data.name}"?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteMutation.mutateAsync(devboxData.data.name);
      toast.success("DevBox deleted successfully");
    } catch (error) {
      toast.error("Failed to delete DevBox");
      console.error("Failed to delete devbox:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDevboxLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading DevBox...</span>
      </div>
    );
  }

  if (!devboxData?.data) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        DevBox not found.
      </div>
    );
  }

  const devbox = devboxData.data;
  const isRunning = devbox.status.toLowerCase() === "running";

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

export function DevboxDeleteCard({
  status,
  args,
  respond,
  result,
}: {
  status: "complete" | "executing" | "inProgress";
  args: { devboxName: string };
  respond?: (response: string) => void;
  result?: any;
}) {
  const context = createDevboxContext();
  const deleteMutation = useDeleteDevboxMutation(context);
  const { devboxName } = args;

  const handleDelete = async () => {
    try {
      if (!devboxName) {
        respond?.("Error: Devbox name is required");
        return;
      }
      const result = await deleteMutation.mutateAsync(devboxName);
      respond?.("Devbox deleted successfully");
    } catch (error) {
      respond?.(`Failed to delete devbox: ${error}`);
    }
  };

  const handleCancel = () => {
    respond?.("deletion canceled");
  };

  if (status === "complete") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-green-600">
            Operation Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {result || "Operation completed successfully"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status === "executing") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-destructive">
            Delete Devbox
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Are you sure you want to delete devbox:{" "}
            <strong className="font-semibold">{devboxName}</strong>?
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete Devbox
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Preparing to Delete
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Preparing to delete {devboxName}...</span>
        </div>
      </CardContent>
    </Card>
  );
}
