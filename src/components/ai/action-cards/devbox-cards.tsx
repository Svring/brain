"use client";

import type {
  DevboxListItem,
  DevboxListResponse,
} from "@/lib/sealos/devbox/schemas";
import { useManageDevboxLifecycleMutation } from "@/lib/sealos/devbox/devbox-method/devbox-mutation";
import { createDevboxContext } from "@/lib/sealos/devbox/devbox-utils";
import { Button } from "@/components/ui/button";
import { Play, Pause, Loader2 } from "lucide-react";
import { useState } from "react";

export function DevboxListCard({
  devboxList: { data },
}: {
  devboxList: DevboxListResponse;
}) {
  const [loadingDevboxes, setLoadingDevboxes] = useState<Set<string>>(
    new Set()
  );
  const context = createDevboxContext();
  const lifecycleMutation = useManageDevboxLifecycleMutation(context);

  const handleLifecycleAction = async (
    devboxName: string,
    action: "start" | "stop"
  ) => {
    setLoadingDevboxes((prev) => new Set(prev).add(devboxName));
    try {
      await lifecycleMutation.mutateAsync({
        devboxName,
        action,
      });
    } catch (error) {
      console.error(`Failed to ${action} devbox:`, error);
    } finally {
      setLoadingDevboxes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(devboxName);
        return newSet;
      });
    }
  };

  if (!data?.length) {
    return <div className="text-muted-foreground">No DevBoxes found.</div>;
  }

  return (
    <div className="bg-card rounded-lg">
      <div className="space-y-2">
        {data.map((devbox: DevboxListItem) => {
          const isLoading = loadingDevboxes.has(devbox.name);
          return (
            <div
              key={devbox.id}
              className="flex items-center justify-between p-2 rounded-lg bg-card"
            >
              <p>{devbox.name}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLifecycleAction(devbox.name, "start")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLifecycleAction(devbox.name, "stop")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
