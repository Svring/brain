"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Play, Square, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import {
  manageDevboxLifecycle,
  deleteDevbox,
} from "@/lib/sealos/devbox/devbox-api/devbox-open-api";
import type { DevboxInfo } from "@/lib/sealos/devbox/devbox-api/devbox-open-api-schemas/devbox-query-schema";

interface DevboxGetCardProps {
  data: DevboxInfo | undefined;
}

export function DevboxGetCard({ data }: DevboxGetCardProps) {
  const context = createDevboxContext();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const lifecycleMutation = useMutation({
    mutationFn: async ({
      name,
      action,
    }: {
      name: string;
      action: "start" | "stop";
    }) => {
      return manageDevboxLifecycle({ devboxName: name, action }, context);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox"] });
      toast.success("DevBox lifecycle action completed successfully");
    },
    onError: (error) => {
      console.error("Lifecycle action failed:", error);
      toast.error("Failed to perform lifecycle action");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      return deleteDevbox(name, context);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sealos", "devbox"] });
      toast.success("DevBox deleted successfully");
      setIsDeleting(false);
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      toast.error("Failed to delete DevBox");
      setIsDeleting(false);
    },
  });

  const handleLifecycleAction = (action: "start" | "stop") => {
    if (!data?.name) return;

    lifecycleMutation.mutate({ name: data.name, action });
  };

  const handleDelete = () => {
    if (!data?.name) return;

    setIsDeleting(true);
    deleteMutation.mutate(data.name);
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading DevBox details...</span>
      </div>
    );
  }

  const getStateColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "running":
        return "bg-green-100 text-green-800 border-green-200";
      case "stopped":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{data.name}</CardTitle>
          <Badge className={getStateColor(data.status)}>{data.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">
              Working Dir:
            </span>
            <p>{data.workingDir}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Image:</span>
            <p className="truncate">{data.imageName}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">CPU:</span>
            <p>{data.cpu}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Memory:</span>
            <p>{data.memory}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {data.status?.toLowerCase() === "running" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLifecycleAction("stop")}
              disabled={lifecycleMutation.isPending}
            >
              {lifecycleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Square className="h-4 w-4 mr-2" />
              )}
              Stop
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLifecycleAction("start")}
              disabled={lifecycleMutation.isPending}
            >
              {lifecycleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Start
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting || deleteMutation.isPending}
              >
                {isDeleting || deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete DevBox</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{data.name}"? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
