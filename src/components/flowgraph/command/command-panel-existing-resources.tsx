"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTRPCClients } from "@/hooks/trpc/use-trpc-clients";
import { useQuery } from "@tanstack/react-query";

interface ExistingResourcesProps {
  onBack: () => void;
}

export function ExistingResources({ onBack }: ExistingResourcesProps) {
  const { devbox, cluster, launchpad } = useTRPCClients();

  // Simply call the three list queries
  const { data: devboxes } = useQuery(devbox.list.queryOptions());
  const { data: clusters } = useQuery(cluster.list.queryOptions());
  const { data: launchpads } = useQuery(launchpad.list.queryOptions());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold">Add Existing Resources</h2>
              <p className="text-sm text-muted-foreground">
                Queries called successfully
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm text-muted-foreground">
          <p>Devboxes: {devboxes?.length || 0}</p>
          <p>Clusters: {clusters?.length || 0}</p>
          <p>Launchpads: {launchpads?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}
