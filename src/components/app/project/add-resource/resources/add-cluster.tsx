"use client";

import { use, useState } from "react";
import type {
  ClusterCreateRequest,
  DbForm,
} from "@/lib/sealos/cluster/schemas/req-res-schemas/req-res-create-schemas";
import { Button } from "@/components/ui/button";
import {
  createClusterContext,
  generateClusterName,
} from "@/lib/sealos/cluster/cluster-utils";
import { AuthContext } from "@/contexts/auth-context/auth-context";
import { useCreateClusterMutation } from "@/lib/sealos/cluster/cluster-mutation";
import {
  CLUSTER_TYPE_VERSION_MAP,
  CLUSTER_TYPE_ICON_MAP,
} from "@/lib/sealos/cluster/cluster-constant";
import { Label } from "@/components/ui/label";

type ClusterType = keyof typeof CLUSTER_TYPE_VERSION_MAP;

export default function AddCluster() {
  const { user } = use(AuthContext);
  const [selectedType, setSelectedType] = useState<ClusterType>("postgresql");
  const [created, setCreated] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(""); // for internal default selection

  // Create the context and mutation hook
  const clusterContext = createClusterContext();
  const createClusterMutation = useCreateClusterMutation(clusterContext);

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

    const dbForm: DbForm = {
      dbType: selectedType,
      dbVersion: selectedVersion,
      dbName: generateClusterName(),
      replicas: 1,
      cpu: 1000,
      memory: 2048,
      storage: 10,
      labels: {},
      autoBackup: {
        start: false,
        type: "day",
        week: [],
        hour: "0",
        minute: "0",
        saveTime: 7,
        saveType: "d",
      },
      terminationPolicy: "Delete",
    };

    const request: ClusterCreateRequest = {
      dbForm,
      isEdit: false,
    };

    createClusterMutation.mutate(request, {
      onSuccess: () => {
        setCreated(true);
      },
      onError: (error) => {
        console.error("Failed to create cluster:", error);
      },
    });
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

      <Button
        className="mt-4 w-full"
        onClick={handleCreate}
        disabled={createClusterMutation.isPending || created}
      >
        {created
          ? "Created"
          : createClusterMutation.isPending
          ? "Creating..."
          : "Create Cluster"}
      </Button>
    </div>
  );
}
