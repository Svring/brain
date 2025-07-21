"use client";

import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useDeleteDevboxMutation,
} from "@/lib/sealos/devbox/devbox-method/devbox-mutation";

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
      <Card className="w-full">
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
      <Card className="w-full">
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