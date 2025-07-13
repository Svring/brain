"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClusterContext } from "@/lib/sealos/cluster/cluster-utils";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useCreateClusterAction } from "@/lib/sealos/cluster/cluster-action/cluster-action";
import {
  CLUSTER_TYPE_VERSION_MAP,
  CLUSTER_TYPE_ICON_MAP,
} from "@/lib/sealos/cluster/cluster-constant";
import { Label } from "@/components/ui/label";
import { useToggle } from "@reactuses/core";

type ClusterType = keyof typeof CLUSTER_TYPE_VERSION_MAP;

export default function AddCluster() {
  const { user } = use(AuthContext);
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
        },
        onError: (error: unknown) => {
          console.error("Failed to create cluster:", error);
          toggleLoading(false);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Database Type */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {Object.keys(CLUSTER_TYPE_VERSION_MAP).map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => handleTypeChange(type as ClusterType)}
              type="button"
              className="flex flex-col items-center justify-center gap-1 w-20 h-20 p-2"
            >
              <div
                className="rounded-lg p-1 flex items-center justify-center mb-1"
                style={{ width: 36, height: 36 }}
              >
                <img
                  src={CLUSTER_TYPE_ICON_MAP[type]}
                  alt={`${type} icon`}
                  width={32}
                  height={32}
                />
              </div>
              <span className="text-xs text-center break-words capitalize">
                {type}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Database Version is auto-selected */}

      {/* No additional resource configuration */}

      <Button className="mt-4 w-full" onClick={handleCreate} disabled={loading}>
        {loading ? "Creating..." : "Create Cluster"}
      </Button>
    </div>
  );
}
