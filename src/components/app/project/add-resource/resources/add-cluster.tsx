"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClusterContext } from "@/lib/sealos/cluster/cluster-utils";
import { useCreateClusterAction } from "@/lib/sealos/cluster/cluster-action/cluster-action";
import {
  CLUSTER_TYPE_VERSION_MAP,
  CLUSTER_TYPE_ICON_MAP,
} from "@/lib/sealos/cluster/cluster-constant";
import { Label } from "@/components/ui/label";
import { useToggle } from "@reactuses/core";
import { toast } from "sonner";

type ClusterType = keyof typeof CLUSTER_TYPE_VERSION_MAP;

export default function AddCluster() {
  const [selectedType, setSelectedType] = useState<ClusterType>("postgresql");
  const [selectedVersion, setSelectedVersion] = useState<string>(""); // for internal default selection
  const [loading, toggleLoading] = useToggle(false);

  // Create the context and mutation hook
  const clusterContext = createClusterContext();
  const createClusterAction = useCreateClusterAction(clusterContext);

  // Get available versions for selected type
  const availableVersions = CLUSTER_TYPE_VERSION_MAP[selectedType];

  // Set default version when type changes
  const handleTypeChange = (type: ClusterType) => {
    setSelectedType(type);
    setSelectedVersion(availableVersions[0]?.id || "");
  };

  // Ensure a default version is always selected
  if (!selectedVersion && availableVersions.length > 0) {
    setSelectedVersion(availableVersions[0].id);
  }

  const handleCreate = () => {
    if (!selectedVersion) return;

    toggleLoading(true);
    createClusterAction.mutate(
      {
        dbType: selectedType,
        dbVersion: selectedVersion,
      },
      {
        onSuccess: () => {
          toggleLoading(false);
          toast.success("Cluster created successfully");
        },
        onError: (error: unknown) => {
          console.error("Failed to create cluster:", error);
          toggleLoading(false);
          toast.error("Failed to create cluster");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Select Database Type</Label>
        <div className="grid grid-cols-3 gap-3">
          {Object.keys(CLUSTER_TYPE_VERSION_MAP).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => handleTypeChange(type as ClusterType)}
              type="button"
              className="flex flex-col items-center justify-center gap-2 h-20 p-3 text-center"
            >
              <div className="w-7 h-7 flex items-center justify-center">
                <img
                  src={CLUSTER_TYPE_ICON_MAP[type]}
                  alt={`${type} icon`}
                  width={28}
                  height={28}
                  className="rounded"
                />
              </div>
              <span className="text-xs font-medium leading-tight break-words capitalize">
                {type}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t">
        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={loading}
          size="sm"
        >
          {loading ? "Creating..." : "Create Cluster"}
        </Button>
      </div>
    </div>
  );
}
